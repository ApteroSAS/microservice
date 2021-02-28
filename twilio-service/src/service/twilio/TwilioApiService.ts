import TwilioService from "./TwilioService";

const express = require('express');

export default class TwilioApiService {
    public expressApp;

    constructor(public service:TwilioService, public version) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = this.version;//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.get('/token', (req, res) => {
            const { identity, roomName } = req.query;
            try{
                this.service.getToken(identity,roomName).then((jwtToken)=>{
                    res.send(jwtToken);
                }).catch(err =>{
                    console.error(err);
                    res.status(500).json(err);
                })
            }catch(err){
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.post('/token', (req, res) => {
            let json = req.body;
            try{
                this.service.getToken(json.identity,json.room).then((jwtToken)=>{
                    res.json({token:jwtToken});
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