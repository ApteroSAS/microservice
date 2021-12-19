import {properties} from "@root/properties/properties";
import {RoomModel} from "@root/mongodb/RoomModel";
import * as mongoose from "mongoose";

export class Mongoose {
    start(){
        const db = properties.MONGODB;

        const models = {
            RoomModel: RoomModel,
        };

        // Connect to MongoDB with Mongoose.

        if (properties.MONGODB !== "DISABLED") {
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
            mongoose.connection.on('error', function () {
                console.log('Could not connect to MongoDB');
            });

            mongoose.connection.on('disconnected', function () {
                process.exit(1);//in a container this will be restarted automaticaly
                console.log('Lost MongoDB connection...');
                if (!isConnectedBefore)
                    connect();
            });
            mongoose.connection.on('connected', function () {
                isConnectedBefore = true;
                console.log('Connection established to MongoDB');
            });

            mongoose.connection.on('reconnected', function () {
                console.log('Reconnected to MongoDB');
            });
        }
    }
}
