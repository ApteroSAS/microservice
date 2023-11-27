import {properties} from "@root/properties/properties";
import mongoose from "mongoose";

export async function startMongoose(){
    const db = properties.MONGODB;

    // Connect to MongoDB with Mongoose.

    if(properties.MONGODB!=="DISABLED") {
        mongoose.connection.on('error', function() {
            console.log('Could not connect to MongoDB');
        });

        mongoose.connection.on('disconnected', function(){
            process.exit(1);//in a container this will be restarted automatically
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
    }
}
