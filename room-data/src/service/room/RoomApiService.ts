import RoomDataBaseService from "@root/mongodb/RoomDataBaseService";
import {PgRoom} from "@root/postgrest/PgRoom";
import {JWTAuth} from "@root/jwt/JWTAuth";
import PhoenixController from "@root/reticulum/PhoenixController";
import AdapterProfileService from "@root/service/room/AdapterProfileService";
import {properties} from "@root/properties/properties";
import {PgRoleMenmbership} from "@root/postgrest/PgRoleMenmbership";
import {RoomService} from "@root/service/room/RoomService";

const express = require('express');

export default class RoomApiService {
    public expressApp;
    public feathersApp: any = null;
    adapterService = new AdapterProfileService();

    constructor(
        public roomDB: RoomDataBaseService,
        private pgRoom: PgRoom,
        private pgRoleMenmbership:PgRoleMenmbership,
        private jwt: JWTAuth,
        private phoenixController: PhoenixController,
        private roomService: RoomService
    ) {
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
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.post('/room/jwt/helper/mongo', async (req, res) => {
            let json = req.body;
            let data = json.data;
            let sid = json.hubsid;
            let jwt = json.jwt;
            let payload: any = await this.jwt.verifyAndDecode(jwt, {issuer: "ret"});
            if(payload.sub == properties.ADMIN_USER){
                let ret = await this.jwt.createMongoJWT(sid,data);
                res.json(ret);
            }else{
                res.status(500).json("USER NOT ADMIN");
            }
        });

        router.post('/room/update/mongo', async (req, res) => {
            let json = req.body;
            let jwt = json.jwt;
            //https://jwt.io/
            /*
            header {
              "alg": "HS512",
              "typ": "JWT"
            }
            payload:{
              "iss":"aptero",
              "hubSID":"vGgHMPT",
              "data":{"entry_mode":"invite"}
            }
             */
            let payload: any = await this.jwt.verifyAndDecode(jwt, {issuer: "aptero"});
            this.roomDB.updateRoomMongo(payload.hubSID, payload.data).then((room) => {
                res.json(room);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.post('/room/update/pg', async (req, res) => {
            let json = req.body;
            let jwt = json.jwt;
            //https://jwt.io/
            /*
            header {
              "alg": "HS512",
              "typ": "JWT"
            }
            payload:{
              "iss":"aptero",
              "hubSID":"vGgHMPT",
              "data":{"entry_mode":"invite"}
            }
             */
            let payload: any = await this.jwt.verifyAndDecode(jwt, {issuer: "aptero"});
            this.pgRoom.updateRoom(payload.hubSID, payload.data).then((room) => {
                this.processPgRoomUpdate(payload);
                res.json(room);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.post('/room/admin/', async (req, res) => {
            let roomSID = req.params.sid;
            let json = req.body;
            let jwt = json.jwt;
            //https://jwt.io/
            /*
            header {
              "alg": "HS512",
              "typ": "JWT"
            }
            payload:{
              "iss":"aptero",
              "hubSID":"vGgHMPT",
              "account_id":"toto@aptero.co",
              "enable":true
            }
             */
            let payload: any = await this.jwt.verifyAndDecode(jwt, {issuer: "aptero"});
            let account_id = payload.account_id;
            let hubSID = payload.hubSID;
            const dbId = await this.pgRoom.getDBId(hubSID);
            let enable = payload.enable;
            this.pgRoleMenmbership.updateRoom(dbId,account_id,enable).then((result) => {
                res.json(result);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.get('/room/:sid', (req, res) => {
            let roomSID = req.params.sid;
            this.roomDB.findRoom(roomSID).then((room) => {
                res.json(room);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.get('/room/:sid/embed/token/', async (req, res) => {
            let roomSID = req.params.sid;
            this.pgRoom.getEmbedToken(roomSID).then((token) => {
                res.json(token);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.get('/adapter/:sid/profile', (req, res) => {
            let aid = req.params.sid;
            try {
                res.json(this.adapterService.getProfiles()[aid]);
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/room/:sid/clone', (req, res) => {
            let roomSID = req.params.sid;
            this.roomService.clone(roomSID).then((room) => {
                res.json(room);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.get('/room/:sid/people', (req, res) => {
            let roomSID = req.params.sid;
            this.roomService.people(roomSID).then((room) => {
                res.json(room);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.get('/room/:sid/entry', (req, res) => {
            let roomSID = req.params.sid;
            this.roomService.entry(roomSID).then((room) => {
                res.json(room);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.get('/room/:sid/trigger/update', (req, res) => {
            let roomSID = req.params.sid;
            this.phoenixController.sendRoomUpdated(roomSID).then((room) => {
                res.json(room);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        this.expressApp.use('/', router);
    }

    async processPgRoomUpdate(payload) {
        if (!payload && !payload.hubSID) {
            return;
        }
        if (payload.data.entry_mode === "invite") {
            await this.phoenixController.sendMessageToRoomStandalone(payload.hubSID, "Room Locked")
        }
        if (payload.data.entry_mode === "allow") {
            await this.phoenixController.sendMessageToRoomStandalone(payload.hubSID, "Room Unlocked")
        }
    }

    start(expressApp: any): void {
        this.feathersApp = expressApp;
        this.expressApp = expressApp;
        this.mountAPI();
    }

}

