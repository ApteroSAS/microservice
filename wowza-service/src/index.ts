import 'module-alias/register';

import cors from "cors";
import express from "express";

import WowzaApiService from "@root/service/wowza/WowzaApiService";

///////// Display version ////
export const BUILD_VERSION = require('../package.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

///////// SETUP Express ////
let expressApp = express();
expressApp.use(cors());

///////// Error management ////
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

///////// Start server ////
let port = 8286;
expressApp.listen(port, () => {
    let apiService: WowzaApiService = new WowzaApiService();
    apiService.start(expressApp);
    console.log('Listening on ' + port);
});
