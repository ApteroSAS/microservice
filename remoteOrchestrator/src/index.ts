const express = require("express");
const http = require("http");
const {exec} = require("child_process");
const Docker = require('dockerode');
const cors = require('cors');
const io = require('socket.io');
const ioClient = require("socket.io-client");

class App{
    private io: any;
    private docker: any;
    private networkName = "web_renderer_network";
    private localhostMode = false;
    private serverSocket: any;
    constructor(){
        this.setupDocker();
        this.setupSocket();
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
                if(err.json.message !== 'Pool overlaps with other one on this address space') {
                    console.error(err);
                }
            }
        });
    }

    setupSocket(){
        const expressapp = express();
        expressapp.use(cors({
            origin: (origin, callback)=>{
                // allow requests with no origin
                return callback(null, true);
            }
        }));
        const server = http.createServer(expressapp);
        this.io = io(server, {
            path: '/service/remote/orchestrator/socket.io'
        });
        this.io.on('connection', socket=>{
            socket.emit("init_ok");
            socket.on("connect_screen",async (data: { localSessionID:string, remoteScreenSessionId: string,screenSizeX:number,screenSizeY:number,startUrl:string })=>{
                console.log("connect_screen",data);
                socket.join("room-"+data.remoteScreenSessionId);
                let controlSocket = await this.createOrRetrieveScreen(data.remoteScreenSessionId,data.screenSizeX,data.screenSizeY,data.startUrl);
                socket.on("event-"+data.remoteScreenSessionId,(event)=>{
                    controlSocket.emit("event",event)
                });
            });
        });
        this.serverSocket = this.io.listen(3443);
        console.log("ready on 3443");
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
        let port = "3443";
        let containerInfo:any = await this.checkIfExist(sessionID);
        if(!containerInfo) {
            let portStr = "";
            if(this.localhostMode){
                let newPort = "3444";
                portStr = "-p "+newPort+":"+port;
                port = newPort;
            }
            let cmd = "docker run -d "+portStr+" -e width="+screenSizeX+" -e height="+screenSizeY+" --privileged --network="+this.networkName+" --name web-renderer-" + sessionID + " --rm registry.aptero.co/web-renderer:latest";
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
        if(this.localhostMode){
            ip="127.0.0.1";
            port = containerInfo.Ports[0].PublicPort;
        }
        const connectString = "http://"+ip+":"+port;
        console.log("connecting to renderer at"+connectString);
        let socket = ioClient.connect(connectString);
        await new Promise((resolve, reject) => {
            socket.once("init_ok",()=>{
                console.log("init_ok on "+connectString + " / " +containerInfo.Id);
                if(startURL){
                    socket.emit("load-url",startURL);
                }
                socket.on("frame", buffer => {
                    this.serverSocket.in("room-"+sessionID).emit("frame-"+sessionID,buffer);
                });
                socket.emit("repaint");
                resolve(true);
            });
        });
        return socket;
    }

}

new App();