import MailService from "./MailService";

const express = require('express');

export default class RoomApiService {
    public expressApp;

    constructor(public mailService:MailService) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.post('/mail', (req, res) => {
            let json = req.body;
            try{
                /*const msg = {
                    to: 'admin@aptero.co', // Change to your recipient
                    from: 'admin@aptero.co', // Change to your verified sender
                    subject: 'Sending with SendGrid is Fun',
                    text: 'and easy to do anywhere, even with Node.js',
                    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
                }*/
                this.mailService.sendMail(json).then(()=>{
                    res.json("ok");
                }).catch(err =>{
                    console.error(err);
                    res.status(500).json(err);
                })
            }catch(err){
                console.error(err);
                res.status(500).json(err);
            }
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}