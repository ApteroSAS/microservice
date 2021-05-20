const {exec} = require("child_process");
const Docker = require('dockerode');

export class NoVNCdocker{
    private docker: any;
    private networkName = "web_renderer_network";

    constructor(){
        this.setupDocker();
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
                        if(name.startsWith("/web-renderer-") && name.endsWith(sessionID)){
                            resolve(containerInfo);
                        }
                    }
                });
                resolve(null);
            });
        });
    }

    async createOrRetrieveScreen(sessionID,screenSizeX:number,screenSizeY:number,startURL:string){
        screenSizeX = screenSizeX || 1024;
        screenSizeY = screenSizeY || 768;
        let port = "8080";
        let containerInfo:any = await this.checkIfExist(sessionID);
        if(!containerInfo) {
            let cmd = "docker run -d --expose "+port+" -e DISPLAY_WIDTH="+screenSizeX+" -e DISPLAY_HEIGHT="+screenSizeY+" --network="+this.networkName+" --name web-renderer-" + sessionID + " --rm registry.aptero.co/web-renderer-v2:latest";
            new Promise(() => {
                //let bashCMD = " /bin/sh "+ "-c "+ "/usr/bin/xvfb-run -a -s \"-screen 0 "+screenSizeX+"x"+screenSizeY+"x24\" node_modules/.bin/electron . "+screenSizeX+" "+screenSizeY;
                console.log(cmd);
                exec(cmd);
            });
        }
        while (!containerInfo) {
            await new Promise(resolve => {
                setTimeout(resolve,300);
            });
            containerInfo = await this.checkIfExist(sessionID);
        }
        let ip = containerInfo.NetworkSettings.Networks[this.networkName].IPAddress;
        return {
            ip,
            port
        };
    }

}