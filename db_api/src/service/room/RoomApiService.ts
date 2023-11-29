import RoomDataBaseService from "@root/mongodb/room/RoomDataBaseService";
import {PgRoom} from "@root/postgrest/PgRoom";
import {JWTAuth} from "@root/jwt/JWTAuth";
import PhoenixController from "@root/reticulum/PhoenixController";
import AdapterProfileService from "@root/service/global/AdapterProfileService";
import {properties} from "@root/properties/properties";
import {PgRoleMembership} from "@root/postgrest/PgRoleMembership";
import {RoomService} from "@root/service/room/RoomService";

import express from "express";
//https://postgrest.org/en/stable/errors.html
export default class RoomApiService {
    expressApp: express.Application;

    constructor(
        public roomDB: RoomDataBaseService,
        private pgRoom: PgRoom,
        private pgRoleMenmbership: PgRoleMembership,
        private jwt: JWTAuth,
        private phoenixController: PhoenixController,
        private roomService: RoomService
    ) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/room/api/version', (req, res) => {
            res.json(apiVersion);
        });

        //deprecated use /room/info
        router.post('/get/room', async (req, res) => {
            let json = req.body;
            let roomSID = json.roomSID;
            const room = await this.roomDB.findRoom(roomSID)
            res.json(room);
        });

        router.post('/room/info', async (req, res) => {
            let json = req.body;
            let roomSID = json.roomSID;
            const room = await this.roomDB.findRoom(roomSID)
            res.json(room);
        });

        router.post('/room/copy/params', async (req, res) => {
            try {
                let data: {
                    srcsid: string,
                    dstsid: string,
                    token: string
                } = req.body;
                if (data.token == properties.ADMIN_TOKEN) {
                    let ret = await this.pgRoom.copyParams(data.srcsid, data.dstsid);
                    res.json(ret);
                } else {
                    console.log("USER NOT ADMIN");
                    res.status(500).json("USER NOT ADMIN");
                }
            } catch (e) {
                console.log(e);
                res.status(500).json(e);
            }
        });

        router.post('/room/jwt/helper/mongo', async (req, res) => {
            try {
                let json = req.body;
                let data = json.data;
                let sid = json.hubsid;
                let jwt = json.jwt;
                let payload: any = await this.jwt.verifyAndDecode(jwt, {issuer: "ret"});
                if (payload.sub == properties.ADMIN_USER) {
                    let ret = await this.jwt.createMongoJWT(sid, data);
                    res.json(ret);
                } else {
                    res.status(500).json("USER NOT ADMIN");
                }
            } catch (e) {
                console.log(e);
                res.status(500).json(e);
            }
        });

        router.post('/room/update/mongo', async (req, res) => {
            try {
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
                const room = await this.roomDB.updateRoomMongo(payload.hubSID, payload.data)
                res.json(room);
            } catch (err) {
                console.log(err);
                res.status(500).json(err);
            }
        });

        router.post('/room/update/pg', async (req, res) => {
            try {
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
                const room = await this.pgRoom.updateRoom(payload.hubSID, payload.data)
                await this.processPgRoomUpdate(payload);
                res.json(room);
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.post('/room/admin/', async (req, res) => {
            try {
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
                const result = await this.pgRoleMenmbership.insert(dbId, account_id);
                res.json(result);
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/room/:sid', async (req, res) => {
            try {
                let roomSID = req.params.sid;
                const room = await this.roomDB.findRoom(roomSID);
                res.json(room);
            } catch (err) {
                console.error(err);
                try {
                    res.status(500).json(err.toString());
                }catch (e) {
                    res.status(500).json("error");
                }
            }
        });

        router.get('/room/:sid/embed/token/', async (req, res) => {
            try {
                let roomSID = req.params.sid;
                const token = await this.pgRoom.getEmbedToken(roomSID)
                res.json(token);
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/room/:sid/clone', async (req, res) => {
            try {
                let roomSID = req.params.sid;
                const room = await this.roomService.clone(roomSID)
                res.json(room);
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/room/:sid/people', async (req, res) => {
            try {
                let roomSID = req.params.sid;
                const room = await this.roomService.people(roomSID)
                res.json(room);
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/room/:sid/entry', async (req, res) => {
            try {
                let roomSID = req.params.sid;
                const room = await this.roomService.entry(roomSID)
                res.json(room);
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/room/:sid/trigger/update', async (req, res) => {
            try {
                let roomSID = req.params.sid;
                const room = await this.phoenixController.sendRoomUpdated(roomSID)
                res.json(room);
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        this.expressApp.use('/', router);
    }

    async processPgRoomUpdate(payload: { hubSID: string, data: any }) {
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

    start(expressApp: express.Application): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}

