import {PgRoom} from "@root/postgrest/PgRoom";
import RoomDataBase from "@root/service/room/RoomDataBase";
import PhoenixController from "@root/phoenix/PhoenixController";

export default class AutoUpdateService {

    channels = {};
    lastRoomData = {};

    constructor(private pgRoom:PgRoom, private roomDataBase:RoomDataBase,private phoenixController:PhoenixController){
        roomDataBase.onRoomUpdate(async (room,data) => {
            if(data && data.operationType === "replace" && room && room.roomSID) {
                await this.processRoom(room);
            }
            if(data && data.operationType === "update"){
                //const modification = data.updateDescription.removedFields;
                const docId = data.documentKey._id;
                let room = await roomDataBase.findRoomByMongoId(docId);
                await this.processRoom(room);
            }
        });
    }

    async processRoom(room){
        let phxChannel = await this.phoenixController.connectToRoom(room.roomSID);
        await this.processSoundUpdate(phxChannel, room);
        await phxChannel.leave();
    }

    async processSoundUpdate(phxChannel, room){
        let update = false;
        if(!this.lastRoomData[room.roomSID]){
            update = true;
            this.lastRoomData[room.roomSID] = room;
        }
        if(JSON.stringify(room.preferencesOverride) !== JSON.stringify(this.lastRoomData[room.roomSID].preferencesOverride)){
            update = true;
        }
        if(update) {
            this.lastRoomData[room.roomSID] = room;
            await phxChannel.push("message", {body: room.preferencesOverride, type: "chat_events:sound_db_updated"});
            await phxChannel.push("message", {body: "Sound Preferences Updated", type: "chat"});
            //await phxChannel.push("message", {body: "new parameters : "+JSON.stringify(room.preferencesOverride), type: "chat"});
        }
    }

}