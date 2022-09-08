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

    constructor() {
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

    async getMetaForRoom(roomSID: string, maxLoad: number): Promise<{
        roomSID: string,
        clones: {
            [id: string]: {
                url: string,
                people: number,
                peopleMax: number,
            }
        },
    }> {
        let instances = await this.balancerDataBase.getMetasForRoom(roomSID) || {roomSID: roomSID, clones: {}};

        for (const clonesKey in instances.clones) {
            (instances.clones[clonesKey] as any).people = this.getLoad(clonesKey);
            (instances.clones[clonesKey] as any).peopleMax = maxLoad;
        }
        return instances as any;
    }

    async createClone(roomSID: string): Promise<string> {
        //register url as a clone for this room
        let data = await this.room.clone(roomSID);
        await this.balancerDataBase.addCloneToDb(roomSID, data.hub_id, data.url);
        return data.url;
    }

    async computeUrlAndInstances(urlIn: string): Promise<{
        url: string, instances: {
            roomSID: string,
            clones: {
                [id: string]: {
                    url: string,
                    people: number,
                    peopleMax: number,
                }
            },
        }
    }> {
        let data = this.parseUrl(urlIn);
        let roomEntry = await this.room.getRoomEntry(data.roomSID);
        let maxLoad = roomEntry.room_size;
        let load = roomEntry.member_count + roomEntry.lobby_count;
        let url = urlIn;//nominal case return this url
        if (load > maxLoad) {
            url = await this.computeRedirectUrl(data.roomSID, maxLoad, load);
        }
        let instances = await this.getMetaForRoom(data.roomSID, maxLoad);
        return {url, instances}
    }

    async computeRedirectUrl(roomSID: string, maxLoad: number, load: number): Promise<string> {
        //find a suitable clone (aka a clone with a reasonable load)
        let metasForRoom = await this.balancerDataBase.getMetasForRoom(roomSID)|| {roomSID: roomSID, clones: {}};
        for (const key in metasForRoom.clones) {
            let clone = metasForRoom.clones[key];
            let load = await this.getLoad(key);
            if (load <= maxLoad) {
                return clone.url;//url of the clone
            }
        }
        //at this point if no clone found create one
        return await this.createClone(roomSID);//new url
    }

}