import {PgRoom} from "@root/postgrest/PgRoom";
import RoomDataBase from "@root/service/room/RoomDataBase";
import PhoenixController from "@root/phoenix/PhoenixController";

export default class AutoOpenService {

    channels = {};

    constructor(private pgRoom:PgRoom, private roomDataBase:RoomDataBase,private phoenixController:PhoenixController){
        roomDataBase.onRoomUpdate(async room => {
            let phxChannel = await this.phoenixController.connectToRoom(room.roomSID);
            await phxChannel.push("events:db_updated",room);
            await phxChannel.push("message",{body:room.toString(),type:"chat"});
            await phxChannel.leave();
        });
    }

}