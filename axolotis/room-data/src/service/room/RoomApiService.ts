import RoomDataBase from "@root/service/room/RoomDataBase";
import {properties} from "@root/properties/properties";

const express = require('express');

export default class RoomApiService {
    public expressApp;

    constructor(public roomDB: RoomDataBase) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.get('/room/:rid', (req, res) => {
            const rid = req.params.rid;
            this.roomDB.findRoom(rid).then((room) => {
                res.json(room);
            }).catch((err) => {
                res.status(500).json(err);
            });
        });

        router.post('/room/update/', async (req, res) => {
            let json = req.body;
            if(json.password!==properties.PASSWORD){
                res.status(500).json("invalid password");
            }
            delete json['password'];
            this.roomDB.updateRoom(json.hubSID, json.data).then((room) => {
                res.json(room);
            }).catch((err) => {
                res.status(500).json(err);
            });
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}

