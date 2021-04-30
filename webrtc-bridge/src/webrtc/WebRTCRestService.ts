import {JWTAuth} from "@root/jwt/JWTAuth";
import WebRTCBridge from "@root/webrtc/WebRTCBridge";

const express = require('express');
export const BUILD_VERSION = require('../../package.json').version;

export default class WebRTCRestService {
    public expressApp;

    constructor(public webRTCBridge:WebRTCBridge) {
    }

    mountAPI() {
        let router = express.Router();

        router.get('/api/version', (req, res) => {
            res.json(BUILD_VERSION);
        });

        router.get('/bot', (req, res) => {
            try {
                res.json(this.webRTCBridge.getBotList());
            }catch (e) {
                res.status(500).json(e);
            }
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}