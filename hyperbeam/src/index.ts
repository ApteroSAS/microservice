import 'module-alias/register';

import express from "express";

import HyperBeamApiService from "@root/service/hyperbeam/HyperBeamApiService";
import {WebServer} from "@root/service/WebServer";

///////// Display version ////
export const BUILD_VERSION = require('../version.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

///////// SETUP Express ////
import bodyParser from 'body-parser';
import cors from "cors";
import * as process from "process";
let expressApp = express();
expressApp.use(bodyParser.json());
expressApp.use(cors());
// Parse JSON and form HTTP bodies
expressApp.use(bodyParser.urlencoded({extended: true}));

///////// Start server ////
let port = process.env.PORT || 8286;
console.log("page http://localhost:" + port+"/v1/index.html?url=www.google.com");
expressApp.listen(port, () => {
    let apiService: HyperBeamApiService = new HyperBeamApiService();
    apiService.start(expressApp);
    new WebServer(expressApp);
    console.log('Listening on ' + port);
});
