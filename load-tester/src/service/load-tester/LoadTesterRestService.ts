import {exec} from "child_process";

const express = require('express');

export default class LoadTesterRestService {
    public expressApp;


    constructor() {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        //Compute redirect url for room
        router.post('/start/test', async (req, res) => {
            let data: { type: string, url: string, quantity: number, waitMinute: number,headed:boolean } = req.body;
            try {
                new Promise((resolve, reject) => {
                    //https://playwright.dev/docs/test-parallel
                    const headed = data.headed?"--headed ":"";
                    let cmd = `cross-env url="${data.url}" quantity="${data.quantity}" waitMinute="${data.waitMinute}" playwright test ${headed}--workers ${data.quantity} ${data.type}`;
                    console.log(cmd);
                    exec(cmd, (error, stdout, stderr) => {
                        if (error) {
                            reject({error, stdout, stderr});
                        } else {
                            resolve("done");
                        }
                    });
                });
                res.json(data);
            } catch (e) {
                res.json(e);
            }
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}

