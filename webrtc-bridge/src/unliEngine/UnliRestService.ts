import {JWTAuth} from "@root/jwt/JWTAuth";
import WebRTCBridge from "@root/webrtc/WebRTCBridge";
import UnliEngine from "@root/unliEngine/UnliEngine";

const express = require('express');
export const BUILD_VERSION = require('../../package.json').version;

export default class UnliRestService {
    public expressApp;

    constructor(public unliEngine:UnliEngine) {
    }

    mountAPI() {
        let router = express.Router();

        router.get('/api/version', (req, res) => {
            res.json(BUILD_VERSION);
        });

        router.get('/clients', (req, res) => {
            try {
                res.json(this.unliEngine.getClients());
            }catch (e) {
                res.status(500).json(e);
            }
        });

        this.expressApp.use('/unli', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}