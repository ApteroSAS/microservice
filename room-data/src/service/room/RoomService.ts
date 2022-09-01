import {ReticulumRestAPI} from "@root/reticulum/ReticulumRestAPI";
import {properties} from "@root/properties/properties";
import {PgRoom} from "@root/postgrest/PgRoom";

export class RoomService {
    reticulumRestAPI = new ReticulumRestAPI(properties.RETICULUM_HOST);

    constructor(private pgRoom: PgRoom) {
    }

    async clone(roomSID: string): Promise<{
        "creator_assignment_token": string,
        "embed_token": string
        "hub_id": string,
        "url": string
    }> {
        let roomMeta1 = await this.reticulumRestAPI.getRoomMeta(roomSID);
        let roomMeta = await this.reticulumRestAPI.createRoom(roomMeta1.scene_id, roomMeta1.name);
        await this.pgRoom.updateRoom(roomMeta.hub_id, {max_occupant_count: "" + roomMeta1.room_size});
        return roomMeta;
    }

    async people(roomSID: string): Promise<number> {
        let roomMeta = await this.reticulumRestAPI.getRoomMeta(roomSID);
        return roomMeta.member_count + roomMeta.lobby_count;
    }

    async entry(roomSID: any) {
        return await this.reticulumRestAPI.getRoomMeta(roomSID);
    }
}