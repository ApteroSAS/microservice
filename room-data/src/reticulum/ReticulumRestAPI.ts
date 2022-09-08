import axios from "axios";
import {PromiseQueue} from "@root/reticulum/PromiseQueue";

export class ReticulumRestAPI {

    constructor(private host: string) {
    }

    delayMs = 20;
    promiseQueue = new PromiseQueue<any>();//TODO optim Reticulum is overloaded quite fast so we need to throttle the requests

    async createRoom(sceneSid: string, name: string): Promise<{
        "creator_assignment_token": string,
        "embed_token": string,
        "hub_id": string,
        "status": string,
        "url": string
    }> {
        return this.promiseQueue.add(async () => {
            let axiosResponse = await axios.post(this.host + "/api/v1/hubs", {
                "hub": {
                    "name": name,
                    "scene_id": sceneSid
                }
            });
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
            await new Promise(resolve => setTimeout(resolve, 200));//Wait DB propagation
            return axiosResponse.data;
        }).promise;
    }

    async getRoomMeta(roomSid: string): Promise<{ "description": string, "id": string, "images": { "preview": { "url": string } }, "lobby_count": number, "member_count": number, "name": string, "room_size": number, "scene_id": string, "type": string, "url": string, "user_data": any }> {
        return this.promiseQueue.add(async () => {
            let axiosResponse = await axios.post(this.host + "/api/v1/hubs", {
                "hub": {
                    "hub_sid": roomSid
                }
            });
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
            return axiosResponse.data;
        }).promise;
    }
}