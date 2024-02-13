import 'module-alias/register';

import express from "express";
import 'dotenv/config';

import HyperBeamApiService from "@root/service/hyperbeam/HyperBeamApiService";
import {WebServer} from "@root/service/WebServer";
import {startMongoose} from "@root/mongodb/MongooseService";
import { initializeDatabase } from "@root/service/hyperbeam/HyperbeamStartDB";

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

///////// Setup Mongo ////
//startMongoose(); //moved to HyperbeamStartDB.ts -> initializeDatabase()

///////// Start server ////
let port = process.env.PORT || 8286;
console.log("page http://localhost:" + port+"/v1/index.html?url=www.google.com");
expressApp.listen(port, async () => {
    let apiService: HyperBeamApiService = new HyperBeamApiService();

    try {
      await initializeDatabase(apiService.hb_objects); // Pass the hb_objects map here
    } catch (error) {
        console.error("Failed to initialize database:", error);
        // Handle initialization failure (maybe exit the process)
    }

    apiService.start(expressApp);
    new WebServer(expressApp);
    console.log('Listening on ' + port);
});
