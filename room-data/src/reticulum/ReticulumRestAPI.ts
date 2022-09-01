import axios from "axios";
export class ReticulumRestAPI{

    constructor(private host:string) {
    }

    delayMs = 20;

    async createRoom(sceneSid:string,name:string):Promise<{
        "creator_assignment_token": string,
        "embed_token": string,
        "hub_id": string,
        "status": string,
        "url": string
    }>{
        let axiosResponse = await axios.post(this.host + "/api/v1/hubs",{
            "hub": {
                "name": name,
                "scene_id": sceneSid
            }
        });
        await new Promise(resolve => setTimeout(resolve,this.delayMs));
        return axiosResponse.data;
    }

    async getRoomMeta(roomSid:string):Promise<{"description":string,"id":string,"images":{"preview":{"url":string}},"lobby_count":number,"member_count":number,"name":string,"room_size":number,"scene_id":string,"type":string,"url":string,"user_data":any}> {
        let axiosResponse = await axios.post(this.host + "/api/v1/hubs",{
            "hub": {
                "hub_sid": roomSid
            }
        });
        await new Promise(resolve => setTimeout(resolve,this.delayMs));
        return axiosResponse.data;
    }
}