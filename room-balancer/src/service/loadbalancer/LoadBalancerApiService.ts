import {BalancerAPI} from "@root/service/loadbalancer/BalancerAPI";
import {properties} from "@root/properties/properties";

const express = require('express');

export default class LoadBalancerApiService {
    public expressApp;


    constructor(private balancerApi: BalancerAPI) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        //clone
        router.get('/clone', async (req, res) => {
            try {
                let url = decodeURIComponent(req.query.url);
                let data = await this.balancerApi.createCloneUrl(url);
                res.json(data);
            } catch (e) {
                console.error(e);
                res.json(e);
            }
        });

        //TODO change to post and add token
        router.get('/remove', async (req, res) => {
            try {
                let url = decodeURIComponent(req.query.url);
                let data = await this.balancerApi.remove(url);
                res.json(data);
            } catch (e) {
                console.error(e);
                res.json(e);
            }
        });

        router.post('/allocate/room', async (req, res) => {
            try {
                let url = decodeURIComponent(req.query.url);
                let json: { targetPplNumber: number, token: string } = req.body;
                if (json.token !== properties.ADMIN_TOKEN) {
                    res.json("unauthorized");
                    return;
                }
                let data = await this.balancerApi.allocate(url, json.targetPplNumber);
                res.json(data);
            } catch (e) {
                console.error(e);
                res.json(e);
            }
        });

        router.post('/apply/change', async (req, res) => {
            try {
                let url = decodeURIComponent(req.query.url);
                let data = await this.balancerApi.applyDefaultRoomChangeToOtherInstances(url);
                res.json(data);
            } catch (e) {
                console.error(e);
                res.json(e);
            }
        });

        //must be high availability
        router.get('/meta', async (req, res) => {
            try {
                let url = decodeURIComponent(req.query.url);
                let data = await this.balancerApi.getMetaForRoom(url);
                res.json(data);
            } catch (e) {
                console.error(e);
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

