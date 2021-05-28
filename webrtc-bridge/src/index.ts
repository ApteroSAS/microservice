import 'module-alias/register';
import WebRTCBridge from "@root/webrtc/WebRTCBridge";
import WebRTCRestService from "@root/webrtc/WebRTCRestService";
import {WebServer} from "@root/WebServer";
import UnliRestService from "@root/unliEngine/UnliRestService";
import UnliEngineRoomManager from "@root/unliEngine/UnliEngineRoomManager";
const express = require('express')
let bodyParser = require('body-parser');
let cors = require('cors');

export const BUILD_VERSION = require('../package.json').version;
console.log(BUILD_VERSION);

let expressApp = express();
expressApp.use(bodyParser.json());
expressApp.use(cors());

let port = 8195;
let i =0
expressApp.listen(port, () => {
    /*let webRTCBridge = new WebRTCBridge();
    webRTCBridge.createBridge("fTj63Hg","EjGmJaZ");
    let apiService: WebRTCRestService = new WebRTCRestService(webRTCBridge);
    apiService.start(expressApp);*/
    let ue = new UnliEngineRoomManager();
    ue.createRoom("default",0.0001);
    let room = ue.getRoom("default");
    /*room.generateFake(60,{x:0,y:0,z:0},10);
    room.generateFake(60,{x:100,y:100,z:100},200);
    room.generateFake(60,{x:300,y:300,z:300},5);
    room.generateFake(60,{x:0,y:300,z:300},5);
    room.generateFake(60,{x:0,y:0,z:300},5);*/
    setInterval(()=>{room.generateFake(300,{x:0,y:0,z:i/10000},1);i++}, 300);

    let apiService: UnliRestService = new UnliRestService(ue);
    apiService.start(expressApp);
    new WebServer(expressApp);
    console.log('Listening on '+port);
});


