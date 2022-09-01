import {properties} from "@root/properties/properties";
import {RoomGateway} from "@root/logic/RoomGateway";
import {LBDataBaseService} from "@root/mongodb/LBDataBaseService";

export class BalancerAPI {

    /*
    API rest:
    A RoomId is any RoomId in the balancer pack
    GetMetasForRoom(RoomId) return the db StateData with the load of each room associated
    CreateAClone(RoomId)
    CleanupClones(RoomId)
     */

    room = new RoomGateway(properties.ROOM_SERVICE);
    balancerDataBase = new LBDataBaseService();

    constructor(private maxLoad: number) {
    }

    parseUrl(url): { origin: string, roomSID: string } {
        //https://alphahub.aptero.co/fTj63Hg/room?msteams=true&embed_token=846d38e7d0bc3c49716f5f5cb2577ff8
        let urlObj = new URL(url);

        if (urlObj.origin.startsWith("https://localhost")) {
            return {
                origin: urlObj.origin,
                roomSID: urlObj.searchParams.get("hub_id"),
            };
        } else {
            return {
                origin: urlObj.origin,
                roomSID: urlObj.pathname.split("/")[1],
            };
        }
    }

    async getLoad(roomSID: string): Promise<number> {
        //ROOM api to get the number of user in a room
        return this.room.getUserNumber(roomSID);
    }

    async createClone(roomSID: string): Promise<string> {
        //register url as a clone for this room
        let data = await this.room.clone(roomSID);
        await this.balancerDataBase.addCloneToDb(roomSID,data.hub_id,data.url);
        return data.url;
    }

    async computeRedirectUrl(url: string): Promise<string> {
        let data = this.parseUrl(url);
        let load = await this.getLoad(data.roomSID);
        if (load <= this.maxLoad) {
            return url;//nominal case return this url
        } else {
            //find a suitable clone (aka a clone with a reasonable load)
            let metasForRoom = await this.balancerDataBase.getMetasForRoom(data.roomSID);
            for (const key in metasForRoom.clones) {
                let clone = metasForRoom.clones[key];
                let load = await this.getLoad(key);
                if (load <= this.maxLoad) {
                    return clone.url;//url of the clone
                }
            }
            //at this point if no clone found create one
            return await this.createClone(data.roomSID);//new url
        }
    }

}