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
import AutoUpdateService from "@root/service/room/AutoUpdateService";
import {PgRoleMenmbership} from "@root/postgrest/PgRoleMenmbership";

export const BUILD_VERSION = require('../package.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

/////////

const db = properties.MONGODB;

const models = {
    RoomModel: RoomModel,
};

// Connect to MongoDB with Mongoose.

let connect = function() {
    mongoose.connect(
        db,
        {
            useUnifiedTopology: false,
            useFindAndModify: false,
            useCreateIndex: true,
            useNewUrlParser: true,
            autoReconnect: true,
            //poolSize: 3,
            reconnectTries: 10,
            reconnectInterval: 1000,
            //socketTimeoutMS: 5000
        }
    ).then(() => {
        console.log("MongoDB connected")
    }).catch(err => console.log(err));
};
connect();

let isConnectedBefore = false;
mongoose.connection.on('error', function() {
    console.log('Could not connect to MongoDB');
});

mongoose.connection.on('disconnected', function(){
    process.exit(1);//in a container this will be restarted automaticaly
    console.log('Lost MongoDB connection...');
    if (!isConnectedBefore)
        connect();
});
mongoose.connection.on('connected', function() {
    isConnectedBefore = true;
    console.log('Connection established to MongoDB');
});

mongoose.connection.on('reconnected', function() {
    console.log('Reconnected to MongoDB');
});

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
    let jwtAuth = new JWTAuth(properties.JWT_SECRET);
    let phoenixController = new PhoenixController(jwtAuth, properties.ADMIN_USER, "6f016efef5a501bd");
    let postgrestController: PostgrestController = new PostgrestController(jwtAuth, properties.POSTGREST_HOST);
    let pgRoom = new PgRoom(postgrestController);
    let pgRoleMenmbership = new PgRoleMenmbership(postgrestController);

    let auto: AutoOpenService = new AutoOpenService(pgRoom, db, phoenixController);
    new AutoUpdateService(pgRoom, db, phoenixController);

    let apiService: RoomApiService = new RoomApiService(db, pgRoom,pgRoleMenmbership, jwtAuth, phoenixController);
    apiService.start(expressApp);

    console.log('Listening on ' + port);
});
