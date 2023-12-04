import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * eg:
 * {"_id":{"$oid":"5fbd3f8dea7500129799a0bb"},"roomSID":"TdTY2Xv","permission":{"spawn_emoji":false},"preferencesOverride":{"disableTeleporter":true},"AppConfigOverride":{"adapterParams":{"url":"https://meet.aptero.co/service/twilio/token","adapter":"twilio"}}}
 {"_id":{"$oid":"6491cb0c6b8d4b69532e7132"},"roomSID":"BVYFqKi","customButton":{"iframeUrl":"https://meet.aptero.co/service/static/rooms/BVYFqKi/map-couloir.html","title":"Map"}}
 {"_id":{"$oid":"5fe35fb0e9163f1e750a53e7"},"roomSID":"rYmHxNS","preferencesOverride":{"disableTeleporter":true}}
 {"_id":{"$oid":"5ff5cf10b0a03d3f548bf49f"},"roomSID":"ZnEGnFL","permission":{"spawn_emoji":false,"spawn_camera":false}}
 {"_id":{"$oid":"6013ff415812eeae91ed592b"},"roomSID":"sqQo2AR","entryMode":"2d_now","preferencesOverride":{"disableTeleporter":true,"muteMicOnEntry":true}}
 */

export interface RoomDTO{
    roomSID:string,
    spatialSound:string,
    entryMode:string,
    preferencesOverride:{
        disableTeleporter:boolean,
        muteMicOnEntry:boolean,
    },
    AppConfigOverride: {
        adapterParams: {
            url: string,
            adapter: string
        }
    },
    features:Object,
    permission:{
        spawn_emoji:boolean,
        spawn_camera:boolean,
    }
    customButton:{
        iframeUrl:string,
        title:string,
    }
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
    customButton:{
        type: Object
    },
});
//RoomSchema.index({roomSID:1}, {unique: true, name: "RoomIndex"});
export const roomDB = mongoose.model("Room", RoomSchema);
export const RoomModel = roomDB;
