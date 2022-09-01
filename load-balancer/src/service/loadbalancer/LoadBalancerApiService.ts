import {BalancerAPI} from "@root/service/loadbalancer/BalancerAPI";

const express = require('express');

export default class LoadBalancerApiService {
    public expressApp;


    constructor(private balancerApi:BalancerAPI) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        //Compute redirect url for room
        router.get('/redirect', async (req, res) => {
            let url = req.query.url
            let balancedUrl = await this.balancerApi.computeRedirectUrl(url);
            res.json({url:balancedUrl});
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}

