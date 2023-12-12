import 'module-alias/register';
import cors from "cors";
import express from "express";
import PDFApiService from "@root/service/pdf/PDFApiService";

///////// Display version ////

// disable https check for local configuration
import https from "https";

import bodyParser from "body-parser";

export const BUILD_VERSION = require('../dockflow.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

///////// SETUP Express ////
let expressApp = express();
expressApp.use(bodyParser.json());
expressApp.use(cors());
// Parse JSON and form HTTP bodies
expressApp.use(bodyParser.urlencoded({extended: true}));
https.globalAgent.options.rejectUnauthorized = false;

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

///////// Start server ////
let port = 8086;
expressApp.listen(port, () => {
    //user
    let apiService: PDFApiService = new PDFApiService();
    apiService.start(expressApp);
    console.log('Listening on ' + port);
});
