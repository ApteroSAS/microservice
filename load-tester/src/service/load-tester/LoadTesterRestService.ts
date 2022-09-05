import {exec} from "child_process";
const express = require('express');

export default class LoadTesterRestService {
    public expressApp;
    children = {};


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
            let data: {
                id: string;
                type: string, url: string, quantity: number, waitMinute: number,headed:boolean,workers:number } = req.body;
            data.id = ""+Math.random();
            try {
                //https://playwright.dev/docs/test-parallel
                const headed = data.headed?"--headed ":"";
                const worker = data.workers? data.workers : 1;
                const quantity = Math.ceil(data.quantity/worker);
                if(quantity<3){
                    throw new Error("At least 3 client per worker");
                }
                this.children[data.id]= [];
                for (let i = 0; i < worker; i++) {
                    new Promise((resolve, reject) => {
                        let cmd = `cross-env url="${data.url}" quantity="${quantity}" waitMinute="${data.waitMinute}" playwright test ${headed} ${data.type}`;
                        console.log(cmd);
                        let childProcess = exec(cmd, (error, stdout, stderr) => {
                            if (error) {
                                reject({error, stdout, stderr});
                            } else {
                                resolve("done");
                            }
                        });
                        this.children[data.id].push(childProcess);
                    });
                }
                res.json(data);
            } catch (e) {
                res.json(e);
            }
        });

        router.post('/kill/test', async (req, res) => {
            let data: {id: string} = req.body;
            try {
                const children = this.children[data.id];
                delete this.children[data.id];
                res.json(children[0].kill("SIGINT"));//SIGSTOP SIGKILL
                for (const child of children) {
                    //https://man7.org/linux/man-pages/man7/signal.7.html
                    child.kill("SIGINT");
                    await new Promise(resolve => setTimeout(resolve,4000));
                    child.kill("SIGKILL");
                }
            } catch (e) {
                res.json(e);
            }
        });

        router.post('/kill', async (req, res) => {
            try {
                process.exit()
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

