import MicrosoftAPIBridge from "@root/service/room/MicrosoftAPIBridge";

const express = require('express');

export default class MicrosoftApiService {
    public expressApp;
    public microsoftAPIBridge = new MicrosoftAPIBridge();

    constructor() {
    }

    async mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        //generate ephemeral meeting
        router.post('/api/messages', async (req, res) => {
            this.microsoftAPIBridge.notifyCallUpdate(await req.body)
            res.json("OK");
        });

        router.get('/user/admin/profile', async (req, res) => {
            try{
                res.json(await this.microsoftAPIBridge.getAdminProfile());
            }catch(err){
                console.error(err);
                res.status(500).json(err);
            }
        });
        router.get('/user/:email/profile', async (req, res) => {
            let email = req.params.email;
            try{
                res.json(await this.microsoftAPIBridge.getProfile(email));
            }catch(err){
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.post('/call/create', async (req, res) => {
            try{
                res.json(await this.microsoftAPIBridge.createMultiCall(await req.body.emails));
            }catch(err){
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.post('/call/participants/configureMixer', async (req, res) => {
            try{
                let data = await req.body;
                res.json(await this.microsoftAPIBridge.configureAudioMixer(data.callId,data.sourceEmail,data.participantEmail));
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

