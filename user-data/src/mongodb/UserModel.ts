import mongoose from "mongoose";
import {userProfileDB} from "@root/mongodb/UserProfileModel";
const Schema = mongoose.Schema;
const profile=userProfileDB.schema;

const UserSchema = new Schema({
    accountId:{
        type: String,
        required: true,
        unique : true
    },
    email:{
        type: String,
        required: false
    },
    userId:{
        type: String,
        required: false
    },
    name:{
        type: String,
        required: false
    },
    signinURL:{
        type: String,
        required: false
    },
    lastUpdate:{
        type: String,
        required: false
    },
    
    profile:{
        type:profile,
        required:false
    }
    
});

export const userDB = mongoose.model("User", UserSchema);
export const UserModel = userDB;
