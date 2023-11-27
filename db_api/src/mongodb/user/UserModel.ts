import mongoose from "mongoose";
import {userProfileDB, UserProfileDTO} from "@root/mongodb/user/UserProfileModel";
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

export interface UserDTO{
    id:string,//mongodb id
    accountId:string,
    email:string,
    userId:string,
    name:string,
    signinURL:string,
    lastUpdate:string,
    profile:UserProfileDTO,
}

export const userDB = mongoose.model("User", UserSchema);
export const UserModel = userDB;
