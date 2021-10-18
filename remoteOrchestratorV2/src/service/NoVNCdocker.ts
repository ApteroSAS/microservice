import axios from "axios";

const {exec} = require("child_process");
const Docker = require('dockerode');

export class NoVNCdocker {
    private docker: any;
    private networkName = "web_renderer_network";
    public readonly prefix = "web-renderer-";
    lastHeartBeat = {};
    ephemeralList = {};
    heartBeatDeadTimeMs = (process.env.HEARTBEATMS ? parseInt(process.env.HEARTBEATMS) : null) || 10 * 60 * 1000;

    constructor() {
        this.setupDocker();
        this.containerListInit();
        this.heartBeatCheckerInit();
        console.log("heartBeatDeadTimeMs : " + this.heartBeatDeadTimeMs)
    }

    hearBeatInit(containerInfo){
        if (containerInfo.Names && containerInfo.Names.length === 1) {
            let name: string = containerInfo.Names[0];
            if (name.startsWith("/" + this.prefix)) {
                //reset all heart beat at restart but do not resume old VM
                this.lastHeartBeat[name.replace("/", "")] = new Date();
            }
        }
    }

    ephemeralInit(containerInfo){
        if (containerInfo.Names && containerInfo.Names.length === 1) {
            let name: string = containerInfo.Names[0];
            if (name.startsWith("/" + this.prefix)) {
                if(containerInfo.Labels && containerInfo.Labels.ephemeral)
                //reset all heart beat at restart but do not resume old VM
                this.ephemeralList[name.replace("/", "")] = true;
            }
        }
    }

    containerListInit(){
        this.docker.listContainers((err, containers) => {
            containers.forEach((containerInfo) => {
                this.hearBeatInit(containerInfo);
                this.ephemeralInit(containerInfo);
            });
        });
    }

    heartBeatCheckerInit() {
        const xMs = this.heartBeatDeadTimeMs;//ms => 10min
        setInterval(() => {
            try {
                Object.keys(this.lastHeartBeat).forEach(key => {
                    //if the heart beat is older than X we pause the container
                    if (this.lastHeartBeat[key] && this.lastHeartBeat[key].getTime() < (new Date().getTime() - xMs)) {
                        try {
                            this.pauseOrCleanUp(key);
                            delete this.lastHeartBeat[key];
                        } catch (e) {
                            delete this.lastHeartBeat[key];
                        }
                    }
                });
            } catch (e) {
                console.warn(e);
            }
        }, Math.floor(xMs / 10));
    }

    setupDocker() {
        this.docker = new Docker();
        this.docker.listContainers((err, containers) => {
            if (containers) {
                containers.forEach((containerInfo) => {
                    console.log(containerInfo.Names[0]);
                });
            }
        });
        this.docker.ping((err, data) => {
            console.log(data);
        });
        this.docker.version((err, data) => {
            console.log(data);
        });
        /*this.docker.info((err, data) => {
            console.log(data);
        });*/
        this.execDockerCommand("docker network create " + this.networkName).catch(reason => {
            if(reason.stderr !== "Error response from daemon: network with name web_renderer_network already exists\n"){
                throw new Error(reason);//otherwise ignore
            }
        });
        /*this.docker.createNetwork({
            "Name": this.networkName,
            "Driver": "bridge",
            "IPAM": {
                "Config": [{
                    "Subnet": "172.20.0.0/16",
                    "IPRange": "172.20.0.0/16",
                    "Gateway": "172.20.0.1"
                }]
            }
        }, (err, network) => {
            if (err) {
                if (err.json?.message !== 'Pool overlaps with other one on this address space') {
                    console.error(err);
                }
            }
        });*/
    }

    async checkIfExist(sessionID): Promise<any> {
        return new Promise((resolve, reject) => {
            this.docker.listContainers((err, containers) => {
                containers.forEach((containerInfo) => {
                    if (containerInfo.Names && containerInfo.Names.length === 1) {
                        let name: string = containerInfo.Names[0];
                        if (name.startsWith("/" + this.prefix) && name.endsWith(sessionID)) {
                            resolve(containerInfo);
                        }
                    }
                });
                resolve(null);
            });
        });
    }

    async checkIfExistAndAlive(sessionID): Promise<any> {
        return new Promise((resolve, reject) => {
            this.docker.listContainers((err, containers) => {
                containers.forEach((containerInfo) => {
                    if (containerInfo.Names && containerInfo.Names.length === 1) {
                        let name: string = containerInfo.Names[0];
                        if (name.startsWith("/" + this.prefix) && name.endsWith(sessionID)) {
                            if(containerInfo.State==="running") {
                                resolve(containerInfo);
                            }
                        }
                    }
                });
                resolve(null);
            });
        });
    }

    paramsToEnvString(params) {
        if (!params) {
            return "";
        }
        let ret = "";
        for (const key in params) {
            ret += " -e " + key + "=" + params[key]
        }
        return ret;
    }

    async createOrRetrieveScreen(sessionID, screenSizeX: number, screenSizeY: number, dockerImage: string, imageParams: any) {
        screenSizeX = screenSizeX || 1024;
        screenSizeY = screenSizeY || 768;
        let port = "8080";
        let containerInfo: any = await this.checkIfExist(sessionID);
        if (!containerInfo) {
            let cmd = "docker run -d";
            cmd += " -l \"com.docker.compose.project=web-renderer\"";
            if(imageParams && imageParams.EPHEMERAL) {
                cmd += " -l \"ephemeral=true\"";
            }
            cmd += " --expose " + port;
            cmd += " -e DISPLAY_WIDTH=" + screenSizeX + " -e DISPLAY_HEIGHT=" + screenSizeY;
            cmd += this.paramsToEnvString(imageParams);
            cmd += " --network=" + this.networkName;
            cmd += " --name " + this.prefix + sessionID;
            cmd += " --rm";
            cmd += " " + dockerImage;

            //docker run -d -l "com.docker.compose.project=web-renderer" --expose 8080 -e DISPLAY_WIDTH=1024 -e DISPLAY_HEIGHT=768 --network=web_renderer_network --name web-renderer-local-test --rm registry.aptero.co/web-renderer-v2:latest
            this.execDockerCommand(cmd);
        }
        while (!containerInfo) {
            await new Promise(resolve => {
                setTimeout(resolve, 300);
            });
            containerInfo = await this.checkIfExistAndAlive(sessionID);
        }

        let ip = containerInfo.NetworkSettings.Networks[this.networkName].IPAddress;
        let vmsid = this.prefix + sessionID;

        try {
            await this.hearBeat(sessionID);//initial heart beat
            await this.resume(sessionID);//revive container on heart beat. may fail if container already started etc...
        } catch (e) {
            /* do nothing */
        }

        let pingOk = false;
        //INFO comment this while for local debug
        let start = new Date().getTime();
        let globalTimeOut = 20000;
        while (!pingOk) {
            if(new Date().getTime()>(start+globalTimeOut)){
                pingOk=true;
            }
            try {
                //check http server ready
                const resp = await axios.get("http://"+ip+":"+port,{ //"/websockify"
                    timeout: 300,
                    /*headers:{
                        "Connection": "Upgrade",
                        "Upgrade": "websocket",
                        "Sec-WebSocket-Key": "SGVsbG8sIHdvcmxkIQ==",
                        "Sec-WebSocket-Version": "13"
                    }*/
                });//wait 300ms
                //console.log("ICI INFO");
                //console.log(resp);
                if(resp.status == 200){
                    pingOk=true;
                }
            } catch (err) {
                /* ignore error*/
                //console.log(err)
            }
        }

        await new Promise(resolve => {
            setTimeout(resolve, 1000); //just to be sure everything is started
        });
        //curl --header "Connection: Upgrade" --header "Upgrade: websocket" --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" --header "Sec-WebSocket-Version: 13" --max-time 1 http://172.19.0.3:8080/websokify

        return {
            ip,
            port,
            vmsid
        };
    }

    convertSid(sid: string) {
        //security ensure that we are using only prefixed container
        if (sid.startsWith(this.prefix)) {
            return sid;
        } else {
            return this.prefix + sid;
        }
    }

    hearBeat(sid: string) {
        sid = this.convertSid(sid);
        console.log("heart beat :" + sid);
        if (!this.lastHeartBeat[sid] || (this.lastHeartBeat[sid] && this.lastHeartBeat[sid].getTime() < (new Date().getTime() - this.heartBeatDeadTimeMs))) {
            this.resume(sid);//revive container on heart beat
        }
        this.lastHeartBeat[sid] = new Date();

    }

    async execDockerCommand(cmd: string): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(cmd);
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject({error, stdout, stderr});
                } else {
                    resolve("done");
                }
            });
        });
    }

    async pauseOrCleanUp(sid: string): Promise<any> {
        sid = this.convertSid(sid);
        if(this.ephemeralList[sid]){
            return await this.remove(sid).then(()=>{
                delete this.ephemeralList[sid];
            });
        }else{
            return await this.pause(sid);
        }
    }

    async pause(sid: string): Promise<any> {
        sid = this.convertSid(sid);
        let cmd = "docker pause " + sid;
        try {
            await this.execDockerCommand(cmd);
        }catch (e) {
            /* ignore error */
        }
    }

    async resume(sid: string): Promise<any> {
        sid = this.convertSid(sid);
        let cmd = "docker unpause " + sid;
        try {
            return await this.execDockerCommand(cmd);
        }catch (e) {
            /* ignore error */
        }
    }

    async remove(sid: string): Promise<any> {
        sid = this.convertSid(sid);
        let cmd = "docker rm -f " + sid;
        return await this.execDockerCommand(cmd);
    }

    async listContainer(): Promise<String[]> {
        return new Promise<String[]>((resolve, reject) => {
            this.docker.listContainers((err, containers) => {
                let ret = [];
                containers.forEach((containerInfo) => {
                    if (containerInfo.Names && containerInfo.Names.length === 1) {
                        let name: string = containerInfo.Names[0];
                        if (name.startsWith("/" + this.prefix)) {
                            ret.push(name.replace("/",""));
                        }
                    }
                });
                resolve(ret);
            });
        });
    }
}
