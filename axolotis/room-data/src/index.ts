import 'module-alias/register';
import {properties} from "@root/properties/properties";
import {RoomModel} from "@root/mongodb/RoomModel";

import mongoose from "mongoose";
import RoomDataBase from "@root/service/room/RoomDataBase";
import RoomApiService from "@root/service/room/RoomApiService";

export const BUILD_VERSION = require('../version.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

/////////

const db = properties.MONGODB;

const models = {
    RoomModel: RoomModel,
};

// Connect to MongoDB with Mongoose.

if(properties.MONGODB!=="DISABLED") {
    let connect = function () {
        mongoose.connect(
            db,
            {
                //https://mongoosejs.com/docs/connections.html
                //useUnifiedTopology: false,
                //useFindAndModify: false,
                //useCreateIndex: true,
                //useNewUrlParser: true,
                //autoReconnect: true,
                //poolSize: 3,
                //reconnectTries: 10,
                //reconnectInterval: 1000,
                //socketTimeoutMS: 5000
            }
        );
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
}

const express = require('express');
let expressApp = express();

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});


let port = 8186;
expressApp.listen(port, () => {
    let db = new RoomDataBase();
    let apiService: RoomApiService = new RoomApiService(db);
    apiService.start(expressApp);

    console.log('Listening on ' + port);
});
