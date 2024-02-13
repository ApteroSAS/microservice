import axios from "axios";
import {properties} from "@root/properties/properties";

export class RoomGateway {
    constructor(private serviceUrl: string) {
    }

    async copyRoomParams(srcRoomSID: string, dstRoomSID: string): Promise<any> {
        let axiosResponse = await axios.post(this.serviceUrl + `room/copy/params`,
            {
                srcsid: srcRoomSID,
                dstsid: dstRoomSID,
                token: properties.ROOM_SERVICE_ADMIN_TOKEN,
            }
        );
        return axiosResponse.data;
    }

    async getUserNumber(roomSID: string): Promise<number> {
        let axiosResponse = await axios.get(this.serviceUrl + `room/${roomSID}/people`);
        return axiosResponse.data;
    }

    async triggerRoomUpdate(roomSID: string): Promise<number> {
        let axiosResponse = await axios.get(this.serviceUrl + `room/${roomSID}/trigger/update`);
        return axiosResponse.data;
    }

    async getRoomEntry(roomSID: string): Promise<{ "description": string, "id": string, "images": { "preview": { "url": string } }, "lobby_count": number, "member_count": number, "name": string, "room_size": number, "scene_id": string, "type": string, "url": string, "user_data": any }> {
        if(!roomSID || roomSID.length !== 7 || roomSID === "service"){
            throw new Error("Invalid roomSID");
        }
        let axiosResponse = await axios.get(this.serviceUrl + `room/${roomSID}/entry`);
        return axiosResponse.data;
    }

    async clone(roomSID: string): Promise<{
        "creator_assignment_token": string,
        "embed_token": string,
        "hub_id": string,
        "status": string,
        "url": string
    }> {
        let axiosResponse = await axios.get(this.serviceUrl + `room/${roomSID}/clone`);
        return axiosResponse.data;
    }
}