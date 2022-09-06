import {BalancerAPI} from "@root/service/loadbalancer/BalancerAPI";

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

        //Compute redirect url for room
        router.get('/redirect', async (req, res) => {
            try{
                let url = req.query.url
                let data = await this.balancerApi.computeUrlAndInstances(url);
                res.json(data);
            }catch (e) {
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

