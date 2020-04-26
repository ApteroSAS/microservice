import LiveEngine, {LiveFormattedData} from "@root/service/live/LiveEngine";
import {properties} from "@root/properties/properties";

const express = require('express');

export default class LiveApiService {
    public expressApp;
    public feathersApp: any = null;

    constructor(private engine:LiveEngine) {
    }

    convertToReticulumFormat(data:LiveFormattedData[]){
        let entries = [];
        data.forEach(value => {
            entries.push(
                {
                    "attributions": "attributions",
                    "id": value.name,
                    "images": {
                        preview:{
                            url:"https://hub.aptero.co/data/app-thumbnail.png",
                            height: 1280,
                            width: 720,
                        }
                    },
                    "name": value.name,
                    "type": "video/360/live",
                    "url": value.liveURL,
                    "stream": value.uploadURL,
                })
        })
        let ret = {
            "meta": {
                "source": "video360",
                "next_cursor": null
            },
            entries:entries,
            "suggestions": null
        };
        return ret;
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.1.1";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.post('/remove', (req, res) => {
            let json = req.body;
            let user = json.user;
            let name = json.name;
            if (user && name) {
                this.engine.removeLive(user,name).then(result => {
                    res.json(result);
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            } else {
                console.error(new Error("incorrect json"));
                res.status(500).json("incorrect json");
            }
        });

        router.post('/create', (req, res) => {
            let json = req.body;
            let user = json.user;
            let name = json.name;
            if (user && name) {
                this.engine.createLive(user,name).then(result => {
                    res.json(this.convertToReticulumFormat([result]).entries[0]);
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            } else {
                console.error(new Error("incorrect json"));
                res.status(500).json("incorrect json");
            }
        });


        router.post('/get', (req, res) => {
            let json = req.body;
            let user = json.user;
            let filter = json.filter;
            if (user) {
                this.engine.listLive(user,filter).then(result => {
                    res.json(this.convertToReticulumFormat(result));
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            } else {
                console.error(new Error("incorrect json"));
                res.status(500).json("incorrect json");
            }
        });

        this.expressApp.use('/live', router);
    }

    start(expressApp: any): void {
        this.feathersApp = expressApp;
        this.expressApp = expressApp;
        this.mountAPI();
    }

}