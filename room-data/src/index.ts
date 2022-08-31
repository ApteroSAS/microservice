import 'module-alias/register';
import {properties} from "@root/properties/properties";
let bodyParser = require('body-parser');
let cors = require('cors');
import express from "express";
import RoomDataBaseService from "@root/mongodb/RoomDataBaseService";
import RoomApiService from "@root/service/room/RoomApiService";
import PostgrestController from "@root/postgrest/PostgrestController";
import {PgRoom} from "@root/postgrest/PgRoom";
import AutoOpenService from "@root/service/room/AutoOpenService";
import {JWTAuth} from "@root/jwt/JWTAuth";
import PhoenixController from "@root/reticulum/PhoenixController";
import AutoUpdateService from "@root/service/room/AutoUpdateService";
import {PgRoleMenmbership} from "@root/postgrest/PgRoleMenmbership";
import {startMongoose} from "@root/mongodb/MongooseService";
import {RoomService} from "@root/service/room/RoomService";

///////// Display version ////
export const BUILD_VERSION = require('../package.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

///////// SETUP Express ////
let expressApp = express();
expressApp.use(bodyParser.json());
expressApp.use(cors());
// Parse JSON and form HTTP bodies
expressApp.use(bodyParser.urlencoded({extended: true}));

///////// Setup Mongo ////
startMongoose();

///////// Error management ////
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

///////// Start server ////
let port = 8186;
expressApp.listen(port, () => {
    let db = new RoomDataBaseService();
    let jwtAuth = new JWTAuth(properties.JWT_SECRET);
    let phoenixController = new PhoenixController(jwtAuth, properties.ADMIN_USER, "6f016efef5a501bd");
    let postgrestController: PostgrestController = new PostgrestController(jwtAuth, properties.POSTGREST_HOST);
    let pgRoom = new PgRoom(postgrestController);
    let pgRoleMenmbership = new PgRoleMenmbership(postgrestController);

    new AutoOpenService(pgRoom, db, phoenixController);
    new AutoUpdateService(pgRoom, db, phoenixController);
    let roomService = new RoomService(pgRoom);
    let apiService: RoomApiService = new RoomApiService(
        db,
        pgRoom,
        pgRoleMenmbership,
        jwtAuth,
        phoenixController,
        roomService);
    apiService.start(expressApp);

    console.log('Listening on ' + port);
});
