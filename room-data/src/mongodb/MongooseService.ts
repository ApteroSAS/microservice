import {properties} from "@root/properties/properties";
import mongoose from 'mongoose'

export function startMongoose(){
    // Connect to MongoDB with Mongoose.
    if(properties.MONGODB!=="DISABLED") {
        const db = properties.MONGODB;
        let connect = function () {
            mongoose.connect(
                db,{}
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
    }
}