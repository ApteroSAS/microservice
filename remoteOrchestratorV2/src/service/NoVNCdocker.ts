const {exec} = require("child_process");
const Docker = require('dockerode');

export class NoVNCdocker{
    private docker: any;
    private networkName = "web_renderer_network";
    private prefix = "web-renderer-";
    lastHeartBeat = {};
    hearBeatDeadTimeMs = 10*60*1000;

    constructor(){
        this.setupDocker();
        this.heartBeatCheckerInit();
    }

    heartBeatCheckerInit(){
        this.docker.listContainers((err, containers) => {
            containers.forEach((containerInfo) => {
                if(containerInfo.Names && containerInfo.Names.length===1) {
                    let name:string = containerInfo.Names[0];
                    if(name.startsWith("/"+this.prefix)){
                        //reset all heart beat at restart but do not resume old VM
                        this.lastHeartBeat[name.replace("/","")]=new Date();
                    }
                }
            });
        });
        const xMs = this.hearBeatDeadTimeMs;//ms => 10min
        setInterval(()=>{
            try {
                Object.keys(this.lastHeartBeat).forEach(key => {
                    //if the heart beat is older than X we pause the container
                    if(this.lastHeartBeat[key] && this.lastHeartBeat[key].getTime() < (new Date().getTime()-xMs)){
                        this.pause(key);
                    }
                });
            }catch (e) {
                console.warn(e);
            }
        },Math.floor(xMs/10));
    }

    setupDocker(){
        this.docker = new Docker();
        this.docker.listContainers((err, containers) => {
            if(containers) {
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
        this.docker.info((err, data) => {
            console.log(data);
        });
        this.docker.createNetwork({
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
            if(err) {
                if(err.json?.message !== 'Pool overlaps with other one on this address space') {
                    console.error(err);
                }
            }
        });
    }

    async checkIfExist(sessionID):Promise<any>{
        return new Promise((resolve, reject) => {
            this.docker.listContainers((err, containers) => {
                containers.forEach((containerInfo) => {
                    if(containerInfo.Names && containerInfo.Names.length===1) {
                        let name:string = containerInfo.Names[0];
                        if(name.startsWith("/"+this.prefix) && name.endsWith(sessionID)){
                            resolve(containerInfo);
                        }
                    }
                });
                resolve(null);
            });
        });
    }

    async createOrRetrieveScreen(sessionID,screenSizeX:number,screenSizeY:number,startURL:string,dockerImage:string){
        screenSizeX = screenSizeX || 1024;
        screenSizeY = screenSizeY || 768;
        let port = "8080";
        let containerInfo:any = await this.checkIfExist(sessionID);
        if(!containerInfo) {
            let cmd = "docker run -d -l \"com.docker.compose.project=web-renderer\" --expose "+port+" -e DISPLAY_WIDTH="+screenSizeX+" -e DISPLAY_HEIGHT="+screenSizeY+" --network="+this.networkName+" --name " +this.prefix+ sessionID + " --rm "+dockerImage;
            //docker run -d -l "com.docker.compose.project=web-renderer" --expose 8080 -e DISPLAY_WIDTH=1024 -e DISPLAY_HEIGHT=768 --network=web_renderer_network --name web-renderer-local-test --rm registry.aptero.co/web-renderer-v2:latest
            this.execDockerCommand(cmd);
        }
        while (!containerInfo) {
            await new Promise(resolve => {
                setTimeout(resolve,300);
            });
            containerInfo = await this.checkIfExist(sessionID);
        }
        try {
            await this.hearBeat(sessionID);//initial heart beat
            await this.resume(sessionID);//revive container on heart beat. may fail if container already started etc...
        }catch (e) {
            /* do nothing */
        }
        let ip = containerInfo.NetworkSettings.Networks[this.networkName].IPAddress;
        return {
            ip,
            port
        };
    }

    convertSid(sid:string){
        if(sid.startsWith(this.prefix)){
            return sid;
        }else{
            return this.prefix+sid;
        }
    }

    hearBeat(sid: string) {
        sid = this.convertSid(sid);
        console.log("heart beat :"+sid);
        if(this.lastHeartBeat[sid] && this.lastHeartBeat[sid].getTime() < (new Date().getTime()-this.hearBeatDeadTimeMs)){
            this.resume(sid);//revive container on heart beat
        }
        this.lastHeartBeat[sid]=new Date();

    }

    async execDockerCommand(cmd:string):Promise<any>{
        return new Promise((resolve,reject) => {
            console.log(cmd);
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject({error, stdout, stderr});
                }else{
                    resolve("done");
                }
            });
        });
    }

    async pause(sid: string):Promise<any> {
        sid = this.convertSid(sid);
        let cmd = "docker pause "+sid;
        return await this.execDockerCommand(cmd);
    }

    async resume(sid: string):Promise<any> {
        sid = this.convertSid(sid);
        let cmd = "docker unpause "+sid;
        return await this.execDockerCommand(cmd);
    }
}
