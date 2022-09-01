import 'module-alias/register';

import cors from "cors";
import express from "express";

import LoadBalancerApiService from "@root/service/loadbalancer/LoadBalancerApiService";
import {startMongoose} from "@root/mongodb/MongooseService";
import {WebServer} from "@root/service/WebServer";
import {BalancerAPI} from "@root/service/loadbalancer/BalancerAPI";

///////// Display version ////
export const BUILD_VERSION = require('../package.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

///////// SETUP Express ////
let expressApp = express();
expressApp.use(cors());

///////// Setup Mongo ////
startMongoose();

///////// Error management ////
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

///////// Start server ////
let port = 8286;
expressApp.listen(port, () => {
    let apiService: LoadBalancerApiService = new LoadBalancerApiService(new BalancerAPI(20));
    apiService.start(expressApp);
    new WebServer(expressApp);
    console.log('Listening on ' + port);
});
