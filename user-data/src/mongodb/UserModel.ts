import mongoose from "mongoose";
import { ObjectID } from "mongodb";

const Schema = mongoose.Schema;

ObjectID.prototype.valueOf = function() {
    return this.toString();
};

/*

    memeIpfsHash: string,
    uid: string,
    hot: number,
    created: number,
    value: number,
 */
const UserSchema = new Schema({
    accountId:{
        type: String,
        required: true,
        unique : true
    },
    email:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: false
    },
});

export const userDB = mongoose.model("User", UserSchema);
export const UserModel = userDB;