import {properties} from "@root/properties/properties";
import mongoose from "mongoose";

let regularDisconnect = false;
export async function startMongoose(){
    regularDisconnect = false;
    const db = properties.MONGODB;

    // Connect to MongoDB with Mongoose.

    if(properties.MONGODB!=="DISABLED") {
        console.log("MongoDB enabled");
        mongoose.connection.on('error', function() {
            console.log('Could not connect to MongoDB');
        });

        mongoose.connection.on('disconnected', function( data,data2 ) {
            if(!regularDisconnect) {
                console.error('Lost MongoDB connection...');
                process.exit(1);//in a container this will be restarted automatically
            }
            /*console.log('Lost MongoDB connection...');
            if (!isConnectedBefore) {
                connect();
            }*/
        });
        mongoose.connection.on('connected', function() {
            console.log('Connection established to MongoDB');
        });

        mongoose.connection.on('reconnected', function() {
            console.log('Reconnected to MongoDB');
        });

        await mongoose.connect(
            db,{}
        );
        console.log("MongoDB connected");
    } else {
        console.log("MongoDB disabled");
    
    }
}

export async function stopMongoose(){
    if(properties.MONGODB!=="DISABLED") {
        regularDisconnect = true;
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}