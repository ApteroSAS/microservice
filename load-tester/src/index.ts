import 'module-alias/register';

import cors from "cors";
import express from "express";

import LoadTesterRestService from "@root/service/load-tester/LoadTesterRestService";

///////// Display version ////
export const BUILD_VERSION = require('../package.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

///////// SETUP Express ////
let expressApp = express();
expressApp.use(cors());
expressApp.use(express.json())

///////// Error management ////
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

///////// Start server ////
let port = 8296;
expressApp.listen(port, () => {
    let apiService: LoadTesterRestService = new LoadTesterRestService();
    apiService.start(expressApp);
    console.log('Listening on ' + port);
});
