import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const Schema = mongoose.Schema;

ObjectId.prototype.valueOf = function() {
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
        type: Object
    },
});
//RoomSchema.index({roomSID:1}, {unique: true, name: "RoomIndex"});
export const roomDB = mongoose.model("Room", RoomSchema);
export const RoomModel = roomDB;
