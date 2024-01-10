import LoggerDataBase from "@root/service/users/LoggerDataBase";
import express from "express";

export default class LoggerApiService {
    public expressApp:express.Application;

    constructor(public loggerDataBase: LoggerDataBase) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.1.0";//increment this each time you change the api and break the backward compatibility (semver)

        router.get('/user/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.post('/trace', async (req, res) => {
            let json = req.body;
            json.ip = req.ip;  // Extract client IP
            this.loggerDataBase.trace(json);
            res.json("ok");
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: express.Application): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}
