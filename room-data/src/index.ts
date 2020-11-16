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

export const BUILD_VERSION = "1.0.0";
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


////////

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
    console.log('Listening on '+port);
});
