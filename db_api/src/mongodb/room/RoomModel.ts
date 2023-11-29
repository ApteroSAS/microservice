import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface RoomDTO{
    roomSID:string,
    spatialSound:string,
    entryMode:string,
    preferencesOverride:Object,
    AppConfigOverride:Object,
    features:Object,
    permission:Object
}

const RoomSchema = new Schema({
    roomSID:{
        type: String,
        required: true,
        unique : true
    },
    entryMode:{
        type: String
    },
    preferencesOverride:{
        type: Object
    },
    AppConfigOverride:{
        type: Object
    },
    features:{
        type: Object
    },
    permission:{
        type: Object
    },

});
//RoomSchema.index({roomSID:1}, {unique: true, name: "RoomIndex"});
export const roomDB = mongoose.model("Room", RoomSchema);
export const RoomModel = roomDB;
