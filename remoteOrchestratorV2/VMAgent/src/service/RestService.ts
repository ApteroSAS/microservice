import {NoVNCdocker} from "@root/service/NoVNCdocker";

let bodyParser = require('body-parser');

let cors = require('cors');
const express = require('express')

export interface CreateDTO{
    remoteScreenSessionId?: string,
    screenSizeX?: number,
    screenSizeY?: number,
    dockerImage?: string,
    imageParams?: any
}

export class RestService {
    private noVNCdocker: NoVNCdocker;

    constructor(private expressApp, private buildVersion) {
        this.noVNCdocker = new NoVNCdocker();
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
            res.json({apiVersion: apiVersion, buildVersion: this.buildVersion});
        });

        router.post('/create', (req, res) => {
            let data:CreateDTO = req.body;
            try {
                this.noVNCdocker.createOrRetrieveScreen(
                    data.remoteScreenSessionId,
                    data.screenSizeX,
                    data.screenSizeY,
                    data.dockerImage,
                    data.imageParams).then((resData) => {
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
                this.noVNCdocker.hearBeat(sid);
                res.json("OK");
            } catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });

        router.get('/vm/remove/:sid', (req, res) => {
            const sid = req.params.sid;
            try {
                this.noVNCdocker.remove(sid).then((resData) => {
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
                this.noVNCdocker.listContainer().then((resData) => {
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
                this.noVNCdocker.pauseOrCleanUp(sid).then((resData) => {
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
                this.noVNCdocker.resume(sid).then((resData) => {
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
