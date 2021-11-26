import mongoose from "mongoose";
import { ObjectID } from "mongodb";
import { json } from "body-parser";


const Schema = mongoose.Schema;

ObjectID.prototype.valueOf = function() {
    return this.toString();
};
const UserProfileSchema = new Schema({
    phoneNumber:{
        type: String,
        required: false
    },
    Bio:{
        type: String,
        required: false
    },
    LorealMember:{
        type:Boolean,
        required:false
    }
});
export const userProfileDB = mongoose.model("UserProfile", UserProfileSchema);
export const UserProfileModel = userProfileDB;