import {properties} from "@root/properties/properties";
import express from "express";
import {RoomUserBDAccess} from "@root/service/global/RoomUserBDAccess";
import AdapterProfileService from "@root/service/global/AdapterProfileService";

interface ModeratorRequest {
    TOKEN?: string,
    email: string[] | string,
    roomSID: string[] | string,
}

export class RoomUserAPIService {
    public expressApp: express.Application;
    adapterService = new AdapterProfileService();

    constructor(public userdb: RoomUserBDAccess) {
    }

    mountAPI() {
        let router = express.Router();

        router.get('/adapter/:sid/profile', (req, res) => {
            let aid = req.params.sid;
            try {
                res.json(this.adapterService.getProfiles()[aid]);
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.post('/moderator', async (req, res) => {
            try {
                let json: ModeratorRequest = req.body;

                // Extract the token from the Authorization header
                const authHeader = req.headers.authorization;
                const token = (authHeader && authHeader.split(' ')[1]) || json.TOKEN; // Bearer TOKEN_VALUE

                // Check if the token in the body or the token in the header matches the ADMIN_TOKEN
                if (token !== properties.ADMIN_TOKEN) {
                    res.status(500).json("Invalid Token");
                } else {
                    if (!json.email || !json.roomSID) {
                        res.status(500).json("Invalid body : format {email: string[], roomSID: string[]}");
                        return;
                    }
                    json.TOKEN = undefined;
                    //if there is just one email we convert to array
                    if (typeof json.email === "string") {
                        json.email = [json.email];
                    }
                    //if there is just one room we convert to array
                    if (typeof json.roomSID === "string") {
                        json.roomSID = [json.roomSID];
                    }
                    await this.userdb.setModeratorMultiple(json.email, json.roomSID);
                    res.json(json);
                }
            } catch (err) {
                console.error(err);
                try {
                    res.status(500).json(err.toString());
                } catch (e) {
                    res.status(500).json("error");
                }
            }
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: express.Application): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}
