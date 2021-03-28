import {PgRoom} from "@root/postgrest/PgRoom";
import RoomDataBase from "@root/service/room/RoomDataBase";
import PhoenixController from "@root/phoenix/PhoenixController";

export default class AutoOpenService {

    channels = {};

    constructor(private pgRoom:PgRoom, private roomDataBase:RoomDataBase,private phoenixController:PhoenixController){
        roomDataBase.onRoomUpdate(room => {
            this.attachOrDetachObserver(room);
        });
        roomDataBase.getRooms().then(documents => {
            documents.forEach((room) => {
                this.attachOrDetachObserver(room);
            });
        });
    }


    async attachAutoOpener(hubID:string){
        let phxChannel = await this.phoenixController.connectToRoom(hubID);
        this.channels[hubID] = phxChannel;
        let presence = this.phoenixController.getPresence(phxChannel);
        presence.onSync(() => {
            //if 0 the reopen the room
            console.log(hubID+" : people number : "+presence.list(null).length);
            if(presence.list(null).length === 0){
                this.pgRoom.setEntryMode(hubID,"allow");
                console.log(hubID+" : entry mode set to allow");
            }
        });
        console.log("AttachAutoOpener : "+hubID);
    }

    async detachAutoOpener(hubID:string){
        console.log("DetachAutoOpener : "+hubID);
        if(this.channels[hubID]){
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