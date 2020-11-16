import RoomDataBase from "@root/service/room/RoomDataBase";

const express = require('express');

export default class RoomApiService {
    public expressApp;
    public feathersApp: any = null;

    constructor(public roomDB:RoomDataBase) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.post('/get/room', (req, res) => {
            let json = req.body;
            let roomSID = json.roomSID;
            this.roomDB.findRoom(roomSID).then((room) => {
                res.json(room);
            }).catch((err) => {
                res.status(500).json(err);
            });
        });

        router.get('/room/:sid', (req, res) => {
            let roomSID = req.params.sid;
            this.roomDB.findRoom(roomSID).then((room) => {
                res.json(room);
            }).catch((err) => {
                res.status(500).json(err);
            });
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.feathersApp = expressApp;
        this.expressApp = expressApp;
        this.mountAPI();
    }

}