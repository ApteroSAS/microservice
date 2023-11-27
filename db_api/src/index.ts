import 'module-alias/register';
import cors from "cors";
import express from "express";
import {WebServer} from "@root/service/WebServer";
import UserDataBase from "@root/service/users/UserDataBase";
import UserApiService from "@root/service/users/UserApiService";
import {startMongoose} from "@root/mongodb/MongooseService";

///////// Display version ////

// disable https check for local configuration
import https from "https";

import bodyParser from "body-parser";
import RoomDataBaseService from "@root/mongodb/room/RoomDataBaseService";
import {JWTAuth} from "@root/jwt/JWTAuth";
import {properties} from "@root/properties/properties";
import PhoenixController from "@root/reticulum/PhoenixController";
import PostgrestController from "@root/postgrest/PostgrestController";
import {PgRoom} from "@root/postgrest/PgRoom";
import {PgRoleMenmbership} from "@root/postgrest/PgRoleMenmbership";
import {RoomService} from "@root/service/room/RoomService";
import RoomApiService from "@root/service/room/RoomApiService";
import {PgHubRoleMemberships} from "@root/postgrest/PgHubRoleMemberships";
import {RoomUserAPIService} from "@root/service/global/RoomUserAPIService";
import {RoomUserBDAccess} from "@root/service/global/RoomUserBDAccess";

export const BUILD_VERSION = require('../dockflow.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

///////// Setup Mongo ////
startMongoose();

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
    {
        let db = new UserDataBase();
        let apiService: UserApiService = new UserApiService(db);
        apiService.start(expressApp);
        new WebServer(expressApp);
    }

    //room and general
    {
        let db = new RoomDataBaseService();
        let jwtAuth = new JWTAuth(properties.JWT_SECRET);
        let phoenixController = new PhoenixController(jwtAuth, properties.ADMIN_USER, "6f016efef5a501bd");
        let postgrestController: PostgrestController = new PostgrestController(jwtAuth, properties.POSTGREST_HOST);
        let pgRoom = new PgRoom(postgrestController);
        let pgRoleMenmbership = new PgRoleMenmbership(postgrestController);

        let roomService = new RoomService(pgRoom);
        let apiService: RoomApiService = new RoomApiService(
            db,
            pgRoom,
            pgRoleMenmbership,
            jwtAuth,
            phoenixController,
            roomService);
        apiService.start(expressApp);


        let pgHubRoleMemberships = new PgHubRoleMemberships(postgrestController);
        const roomUserDBAccess = new RoomUserBDAccess(pgHubRoleMemberships);
        let roomUserApiService: RoomUserAPIService = new RoomUserAPIService(roomUserDBAccess);
        roomUserApiService.start(expressApp);
    }
    console.log('Listening on ' + port);
});
