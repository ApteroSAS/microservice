import 'module-alias/register';
import {properties} from "@root/properties/properties";
import {RoomModel} from "@root/mongodb/RoomModel";

let socketio = require('@feathersjs/socketio');
let bodyParser = require('body-parser');

let cors = require('cors');
let feathers = require('@feathersjs/feathers');
let express = require('@feathersjs/express');//let express = require('express');
import mongoose from "mongoose";
import RoomDataBase from "@root/service/room/RoomDataBase";
import RoomApiService from "@root/service/room/RoomApiService";
import PostgrestController from "@root/postgrest/PostgrestController";
import {PgRoom} from "@root/postgrest/PgRoom";
import AutoOpenService from "@root/service/room/AutoOpenService";
import {JWTAuth} from "@root/jwt/JWTAuth";
import PhoenixController from "@root/phoenix/PhoenixController";

export const BUILD_VERSION = require('../package.json').version;
console.log(BUILD_VERSION);

/////////

const db = properties.MONGODB;

const models = {
    RoomModel: RoomModel,
};

// Connect to MongoDB with Mongoose.
mongoose.connect(
    db,
    {
        useUnifiedTopology: true,
        useCreateIndex: true,
        useNewUrlParser: true
    }
).then(() => {
    console.log("MongoDB connected")
}).catch(err => console.log(err));

let expressApp = express(feathers());
expressApp.use(bodyParser.json());
expressApp.use(cors());
// Set up REST transport
expressApp.configure(express.rest());
expressApp.configure(socketio());
// Parse JSON and form HTTP bodies
expressApp.use(bodyParser.urlencoded({extended: true}));

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});


let port = 8186;
expressApp.listen(port, () => {
    let db = new RoomDataBase();
    let apiService: RoomApiService = new RoomApiService(db);
    apiService.start(expressApp);

    let jwtAuth = new JWTAuth(properties.JWT_SECRET);
    let phoenixController = new PhoenixController(jwtAuth, properties.ADMIN_USER,"6f016efef5a501bd");
    let postgrestController: PostgrestController = new PostgrestController(jwtAuth, properties.POSTGREST_HOST);
    let pgRoom = new PgRoom(postgrestController);

    let auto: AutoOpenService = new AutoOpenService(pgRoom, db, phoenixController);

    console.log('Listening on ' + port);
});
