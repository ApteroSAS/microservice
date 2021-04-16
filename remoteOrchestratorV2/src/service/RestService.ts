import {NoVNCdocker} from "@root/service/NoVNCdocker";
import {AWSAppStream} from "@root/service/AWSAppStream";

let bodyParser = require('body-parser');

let cors = require('cors');
const express = require('express')

export class RestService {
    private noVNCdocker: NoVNCdocker;
    private awsAppStream: AWSAppStream;

    constructor(private expressApp) {
        this.noVNCdocker = new NoVNCdocker();
        this.awsAppStream = new AWSAppStream();
        this.setupApi();
    }

    setupApi() {
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(cors());
        // Parse JSON and form HTTP bodies
        this.expressApp.use(bodyParser.urlencoded({extended: true}));

        let router = express.Router();
        router.post('/create', (req, res) => {
            let data: { localSessionID: string, remoteScreenSessionId: string, screenSizeX: number, screenSizeY: number, startUrl: string } = req.body;
            try {
                this.noVNCdocker.createOrRetrieveScreen(data.remoteScreenSessionId, data.screenSizeX, data.screenSizeY, data.startUrl).then((resData) => {
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
        router.post('/getStreamApp', (req, res) => {
            //--stack-name FallBackStack --fleet-name FallBackFleet --user-id username --application-id chrome-context --session-context \"meet.aptero.co\
            let data: { stackName: string, fleetName: string, userId: string, applicationId: string, sessionContext: string } = req.body;
            try {
                this.awsAppStream.getStreamingURL(data).then((resData) => {
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