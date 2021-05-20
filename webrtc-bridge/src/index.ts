import 'module-alias/register';
import WebRTCBridge from "@root/webrtc/WebRTCBridge";
import WebRTCRestService from "@root/webrtc/WebRTCRestService";
import UnliEngine from "@root/unliEngine/UnliEngine";
import {WebServer} from "@root/WebServer";
import UnliRestService from "@root/unliEngine/UnliRestService";
const express = require('express')
let bodyParser = require('body-parser');
let cors = require('cors');

export const BUILD_VERSION = require('../package.json').version;
console.log(BUILD_VERSION);

let expressApp = express();
expressApp.use(bodyParser.json());
expressApp.use(cors());

let port = 8195;
expressApp.listen(port, () => {
    /*let webRTCBridge = new WebRTCBridge();
    webRTCBridge.createBridge("fTj63Hg","EjGmJaZ");
    let apiService: WebRTCRestService = new WebRTCRestService(webRTCBridge);
    apiService.start(expressApp);*/
    let ue = new UnliEngine();
    ue.compute();
    let apiService: UnliRestService = new UnliRestService(ue);
    apiService.start(expressApp);
    new WebServer(expressApp);
    console.log('Listening on '+port);
});


