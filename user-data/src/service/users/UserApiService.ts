import UserDataBase from "@root/service/users/UserDataBase";

const express = require('express');

export default class UserApiService {
    public expressApp;
    public feathersApp: any = null;

    constructor(public userdb:UserDataBase) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.1.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.post('/update/user', (req, res) => {
            let json = req.body;
            console.log("URL received '/update/user'",json);
            let accountId = json.accountId;
            let mail = json.mail;
            let signinurl = json.signinurl;
            let name = json.name;
            if(accountId) {
                this.userdb.updateUser(accountId, mail, signinurl).then((user) => {
                    res.json(user);
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            }else{
                console.error("no user id or email");
                res.status(500).json("no user id or email");
            }
        });
        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.feathersApp = expressApp;
        this.expressApp = expressApp;
        this.mountAPI();
    }

}