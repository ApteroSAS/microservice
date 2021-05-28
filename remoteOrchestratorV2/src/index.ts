const {exec} = require("child_process");
const Docker = require('dockerode');

import 'module-alias/register';
const express = require('express')
const app = express()
let bodyParser = require('body-parser');

let cors = require('cors');

export const BUILD_VERSION = require('../package.json').version;
console.log(BUILD_VERSION);

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

class App{
    private io: any;
    private docker: any;
    private networkName = "web_renderer_network";
    private defaultImage = "registry.aptero.co/web-renderer-v2:latest";
    private localhostMode = false;
    private serverSocket: any;
    constructor(){
        this.setupDocker();
        this.setupApi();
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

    setupApi(){
        let expressApp = express();
        expressApp.use(bodyParser.json());
        expressApp.use(cors());
        // Parse JSON and form HTTP bodies
        expressApp.use(bodyParser.urlencoded({extended: true}));

        console.log("ready on 3443");
        let port = 3443;
        expressApp.listen(port, () => {
            let router = express.Router();
            router.post('/create', (req, res) => {
                let data: { localSessionID:string, remoteScreenSessionId: string,screenSizeX:number,screenSizeY:number,startUrl:string,dockerImage:string } = req.body;
                try{
                    this.createOrRetrieveScreen(data.remoteScreenSessionId,data.screenSizeX,data.screenSizeY,data.startUrl,data.dockerImage || this.defaultImage).then((resData)=>{
                        res.json(resData);
                    }).catch(err =>{
                        console.error(err);
                        res.status(500).json(err);
                    })
                }catch(err){
                    console.error(err);
                    res.status(500).json(err);
                }
            });
            expressApp.use('/', router);
            console.log('Listening on '+port);
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

    async createOrRetrieveScreen(sessionID,screenSizeX:number,screenSizeY:number,startURL:string,dockerImage:string){
        screenSizeX = screenSizeX || 1024;
        screenSizeY = screenSizeY || 768;
        let port = "8080";
        let containerInfo:any = await this.checkIfExist(sessionID);
        if(!containerInfo) {
            let cmd = "docker run -d --expose "+port+" -e DISPLAY_WIDTH="+screenSizeX+" -e DISPLAY_HEIGHT="+screenSizeY+" --network="+this.networkName+" --name web-renderer-" + sessionID + " --rm "+dockerImage;
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

new App();