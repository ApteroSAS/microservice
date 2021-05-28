import UnliEngineRoomManager from "@root/unliEngine/UnliEngineRoomManager";

const express = require('express');
export const BUILD_VERSION = require('../../package.json').version;

export default class UnliRestService {
    public expressApp;

    constructor(public unliEngine:UnliEngineRoomManager) {
    }

    mountAPI() {
        let router = express.Router();

        router.get('/api/version', (req, res) => {
            res.json(BUILD_VERSION);
        });

        router.post('/createFake', (req, res) => {
            let json = req.body;
            try {
                res.json(this.unliEngine.getRoom(json.room).generateFake(json.boxSz,json.center,json.numSpheres));
            }catch (e) {
                res.status(500).json(e);
            }
        });

        router.get('/clients', (req, res) => {
            try {
                res.json(this.unliEngine.getRoom("default").getClients());
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