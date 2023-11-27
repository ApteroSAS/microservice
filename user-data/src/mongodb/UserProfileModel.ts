import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
    displayName:{
        type:String,
        required:false
    },
    phoneNumber:{
        type: String,
        required: false
    },
    companyName:{
        type:String,
        required:false
    },
    jobTitle:{
        type:String,
        required:false
    },
    bio:{
        type: String,
        required: false
    },
});
export const userProfileDB = mongoose.model("UserProfile", UserProfileSchema);
export const UserProfileModel = userProfileDB;
