import { properties } from "@root/properties/properties";
import UserDataBase from "@root/service/users/UserDataBase";

const express = require('express');
const axios = require('axios');

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
            if(mail) {
                if(signinurl && mail){
                    const msg = "Merci d'utiliser Aptero! Afin de vous connecter, veuillez suivre le lien suivant. Vous pouvez ignorer cet e-mail si vous ne souhaitez pas vous connecter. :<br/><link><br/><br/>Thanks for using Aptero! To sign-in to aptero, please visit the link below. If you did not make this request, please ignore this e-mail.<br/><link>"
                    axios.post(properties.MAIL_SERVICE+"/mail",{
                        to: mail,
                        from: "admin@aptero.co",
                        subject: "sign-in to Aptero",
                        text: msg.replace("<link>",signinurl),
                        html: msg.replace("<link>",signinurl),
                    })
                }
                this.userdb.updateUser(accountId, mail, signinurl).then((user) => {
                    res.json(user);
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            }else{
                console.error("no email");
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