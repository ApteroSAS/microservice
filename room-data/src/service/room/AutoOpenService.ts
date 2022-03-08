import {PgRoom} from "@root/postgrest/PgRoom";
import RoomDataBase from "@root/service/room/RoomDataBase";
import PhoenixController from "@root/phoenix/PhoenixController";
import {properties} from "@root/properties/properties";

export default class AutoOpenService {

    channels = {};

    constructor(private pgRoom:PgRoom, private roomDataBase:RoomDataBase,private phoenixController:PhoenixController){
        if(properties.MONGODB==="DISABLED") {
            return;
        }
        if(properties.AUTO_OPENER_FEATURE && properties.AUTO_OPENER_FEATURE==="true") {
            roomDataBase.onRoomUpdate(room => {
                if (room && room.roomSID) {
                    this.attachOrDetachObserver(room);
                }
            });
            roomDataBase.getRooms().then(documents => {
                documents.forEach((room) => {
                    this.attachOrDetachObserver(room);
                });
            });
            console.log("AUTO_OPENER_FEATURE : enabled")
        }
        console.log("AUTO_OPENER_FEATURE : disabled")
    }


    async attachAutoOpener(hubID:string){
        let phxChannel = await this.phoenixController.connectToRoom(hubID);
        this.channels[hubID] = phxChannel;
        let presence = this.phoenixController.getPresence(phxChannel);
        presence.onSync(async () => {
            //if 0 the reopen the room
            console.log(hubID+" : people number : "+presence.list(null).length);
            if(presence.list(null).length === 0){
                this.pgRoom.setEntryMode(hubID,"allow");
                await phxChannel.push("message", {body: "Room unlocked", type: "chat"});
                console.log(hubID+" : entry mode set to allow");
            }
        });
        console.log("AttachAutoOpener : "+hubID);
    }

    async detachAutoOpener(hubID:string){
        if(this.channels[hubID]){
            console.log("DetachAutoOpener : "+hubID);
            let channel = this.channels[hubID]
            channel.leave();
            delete this.channels[hubID];
        }
    }

    async attachOrDetachObserver(room){
        if(room.features && room.features.autoOpenWhenEmpty){
            await this.attachAutoOpener(room.roomSID);
        }else{
            await this.detachAutoOpener(room.roomSID);
        }
    }


}
