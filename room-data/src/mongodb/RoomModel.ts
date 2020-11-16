import mongoose from "mongoose";
import { ObjectID } from "mongodb";

const Schema = mongoose.Schema;

ObjectID.prototype.valueOf = function() {
    return this.toString();
};

export interface RoomDTO{
    roomSID:string,
    spatialSound:string,
}

const RoomSchema = new Schema({
    roomSID:{
        type: String,
        required: true,
        unique : true
    },
    spatialSound:{
        type: String,
        required: true
    }
});

export const roomDB = mongoose.model("Room", RoomSchema);
export const RoomModel = roomDB;