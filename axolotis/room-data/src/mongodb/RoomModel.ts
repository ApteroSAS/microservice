import mongoose from "mongoose";
import { ObjectID } from "mongodb";

const Schema = mongoose.Schema;

ObjectID.prototype.valueOf = function() {
    return this.toString();
};

export interface Plugin{
    type:string
}

export interface RoomDTO{
    rid:string,
    entities:Plugin[],
}

const RoomSchema = new Schema({
    rid:{
        type: String,
        required: true,
        unique : true
    },
    entities:{
        type: Array
    },

});
//RoomSchema.index({roomSID:1}, {unique: true, name: "RoomIndex"});
export const roomDB = mongoose.model("Room", RoomSchema);
export const RoomModel = roomDB;
