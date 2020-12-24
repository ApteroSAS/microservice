const {app, BrowserWindow} = require('electron');
//app.disableHardwareAcceleration();
const express = require("express");
const http = require("http");

const expressapp = express();
const cors = require('cors');
expressapp.use(cors({
    origin: (origin, callback)=>{
        // allow requests with no origin
        return callback(null, true);
    }
}));
const server = http.createServer(expressapp);

const io = require('socket.io')(server);

class App{
    constructor(){
        // run this at early startup, before app.on('ready')
        app.commandLine.appendSwitch('--no-sandbox')
        app.once('ready', () => this.ready());
    }
    ready(){
        app.allowRendererProcessReuse = true;
        let width = 1024;
        let height = 768;
        console.log("starting with args : "+process.argv);
        if(process.argv.length === 4){
            width = +process.argv[2];
            height = +process.argv[3];
        }
        console.log("width: "+width+" / height: "+height);
        this.win = new BrowserWindow({
            width: width,
            height: height,
            show: false,
            frame: false,
            webPreferences: {
                sandbox: false,
                offscreen: true,
                transparent: true
            }
        });
        this.setupSocket();
        this.setupWindow();
    }
    setupSocket(){
        io.on('connection', socket=>{
            console.log("Connection received");
            this.client = socket;
            socket.on('event',event=>{
                //console.log("event",event);
                this.win.webContents.sendInputEvent(event);
            });
            socket.on('exit',()=>{
                process.exit(0);
            });
            socket.on('repaint',()=>{
                this.sendToClient('frame',this.last_paint);
            });
            socket.on('load-url',url_string=>{
                if(typeof url_string === "string"){
                    if(url_string.substr(0,7)!=="http://"&&url_string.substr(0,8)!=="https://"){
                        url_string = "http://"+url_string;
                    }
                    this.win.webContents.loadURL(url_string);
                }
            });
            if(this.win){
                this.sendToClient('did-navigate',this.win.webContents.getURL());
            }
            if(this.last_paint){
                this.sendToClient('frame',this.last_paint);
            }
            socket.emit("init_ok");
        });
        io.listen(3443);
        console.log("ready on 3443");
    }
    sendToClient(message,data){
        if(this.client){
            //console.log(message,data);
            this.client.emit(message,data);
        }
    }
    setupWindow(){
        this.win.loadURL('https://google.com');
        this.win.webContents.setFrameRate(15);
        this.win.webContents.on('paint', (event, dirty, image) => {
            this.last_paint = image.toJPEG(65);
            this.sendToClient('frame',this.last_paint);

        });
        this.win.webContents.on('did-fail-load', () =>this.sendToClient('did-fail-load'));
        this.win.webContents.on('did-start-loading', () =>this.sendToClient('did-start-loading'));
        this.win.webContents.on('did-stop-loading', () =>this.sendToClient('did-stop-loading')&&this.resetScrollBar());
        this.win.webContents.on('did-navigate', (event,url) =>this.sendToClient('did-navigate',url)&&this.resetScrollBar());
        this.win.webContents.on('dom-ready', () =>this.resetScrollBar());
    }
    resetScrollBar(){
        this.win.webContents.insertCSS(`
            ::-webkit-scrollbar {
              height: 30px;
              width: 30px;
              background: #e0e0e0;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #4db6ac;
            }
            
            ::-webkit-scrollbar-corner {
              background: #cfcfcf;
            }
        `);
    }
}
new App();