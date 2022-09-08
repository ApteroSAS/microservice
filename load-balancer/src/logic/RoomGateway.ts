import axios from "axios";

export class RoomGateway {
    constructor(private serviceUrl: string) {
    }

    async getUserNumber(roomSID: string): Promise<number> {
        let axiosResponse = await axios.get(this.serviceUrl + `room/${roomSID}/people`);
        return axiosResponse.data;
    }

    async getRoomEntry(roomSID: string):Promise<{"description":string,"id":string,"images":{"preview":{"url":string}},"lobby_count":number,"member_count":number,"name":string,"room_size":number,"scene_id":string,"type":string,"url":string,"user_data":any}> {
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