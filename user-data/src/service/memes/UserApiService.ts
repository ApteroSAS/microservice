import UserDataBase from "@root/service/memes/UserDataBase";

const express = require('express');

export default class UserApiService {
    public expressApp;
    public feathersApp: any = null;

    constructor(public userdb:UserDataBase) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.post('/update/user', (req, res) => {
            let json = req.body;
            let accountId = json.accountId;
            let mail = json.mail;
            let name = json.name;
            this.userdb.updateUser(accountId, mail, name).then((user) => {
                res.json(user);
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