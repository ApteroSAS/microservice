import {CreateData, VMAgentManager} from "@root/service/VMAgentManager";
import {properties} from "@root/properties/properties";

let bodyParser = require('body-parser');

let cors = require('cors');
const express = require('express')

export class RestService {
    vmAgentManagement = new VMAgentManager();
    constructor(private expressApp,private buildVersion) {
        this.setupApi();
    }

    setupApi() {
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(cors());
        // Parse JSON and form HTTP bodies
        this.expressApp.use(bodyParser.urlencoded({extended: true}));

        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json({apiVersion:apiVersion,buildVersion:this.buildVersion});
        });

        router.post('/create', (req, res) => {
            let data: CreateData = req.body;
            try {
                //if(data.agentServerUrl+"/create"===req.url){
                if(new URL(data.agentServerUrl).origin === new URL(req.url).origin){
                    throw new Error("invalid params : "+data.agentServerUrl)
                }
                this.vmAgentManagement.createOrRetrieveScreen(
                    data.remoteScreenSessionId,
                    data.screenSizeX,
                    data.screenSizeY,
                    data.dockerImage,
                    data.imageParams,
                    data.agentServerUrl
                ).then((resData) => {
                    res.json(resData);
                }).catch(err => {
                    console.error(err);
                    res.status(500).json(err);
                })
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/heart/beat/:sid', (req, res) => {
            const sid = req.params.sid;
            try {
                this.vmAgentManagement.hearBeat(sid);
                res.json("OK");
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/vm/remove/:sid', (req, res) => {
            const sid = req.params.sid;
            try {
                this.vmAgentManagement.remove(sid).then((resData) => {
                    res.json(resData);
                }).catch(err => {
                    console.error(err);
                    res.status(500).json(err);
                })
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/vm/list', (req, res) => {
            try {
                this.vmAgentManagement.listContainer().then((resData) => {
                    res.json(resData);
                }).catch(err => {
                    console.error(err);
                    res.status(500).json(err);
                })
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/vm/pause/:sid', (req, res) => {
            const sid = req.params.sid;
            try {
                this.vmAgentManagement.pauseOrCleanUp(sid).then((resData) => {
                    res.json(resData);
                }).catch(err => {
                    console.error(err);
                    res.status(500).json(err);
                })
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        //TODO auth with jwt maybe
        router.get('/vm/resume/:sid', (req, res) => {
            const sid = req.params.sid;
            try {
                this.vmAgentManagement.resume(sid).then((resData) => {
                    res.json(resData);
                }).catch(err => {
                    console.error(err);
                    res.status(500).json(err);
                })
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        this.expressApp.use('/', router);
    }

}
