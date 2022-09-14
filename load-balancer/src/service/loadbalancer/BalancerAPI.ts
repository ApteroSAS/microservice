import {properties} from "@root/properties/properties";
import {RoomGateway} from "@root/logic/RoomGateway";
import {LBDataBaseService} from "@root/mongodb/LBDataBaseService";
import {PromiseQueue} from "@root/service/loadbalancer/PromiseQueue";

const {uniqueNamesGenerator, colors, animals} = require('unique-names-generator');
const newName = () => {
    return uniqueNamesGenerator({
        dictionaries: [colors, animals],
        separator: '-'
    });
}

console.log(newName())

interface Instances {
    roomSID: string,
    clones: {
        [id: string]: {
            url: string,
            name: string,
            people: number,
            peopleMax: number,
            main?: boolean,
            current: boolean,
        }
    },
}

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
    promises: { [id: string]: PromiseQueue<{ url: string }> } = {};
    localFastCache = {};//API to get member count is too slow this will be used instead.
    //ROOM + time Sum the getPeople + Url from the last 40s. Worst case we overSize the room
    private delayMs: number = 15*1000;

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

    async remove(url: string): Promise<boolean> {
        let {roomSID} = this.parseUrl(url);
        return true;
    }

    async getMetaForRoom(url: string): Promise<Instances> {
        let {roomSID} = this.parseUrl(url);
        let instances: Instances = await this.balancerDataBase.getMetasForRoom(roomSID) || {
            roomSID,
            clones: {}
        } as any;
        const mainRoomSid = instances.roomSID;
        for (const clonesKey in instances.clones) {
            let data = await this.room.getRoomEntry(clonesKey);
            instances.clones[clonesKey].url = url.replace(roomSID, clonesKey);
            instances.clones[clonesKey].people = data.member_count + data.lobby_count;//no need for fast cache here since it is just for information
            instances.clones[clonesKey].peopleMax = data.room_size;
            instances.clones[clonesKey].current = clonesKey === roomSID;
        }
        {
            let mainEntry = await this.room.getRoomEntry(mainRoomSid);
            instances.clones[mainRoomSid] = {
                url: url.replace(roomSID, mainRoomSid),
                name: "Default",
                people: mainEntry.member_count + mainEntry.lobby_count,//no need for fast cache here since it is just for information
                peopleMax: mainEntry.room_size,
                main: true,
                current: mainRoomSid === roomSID
            }
        }
        return instances;
    }

    async createClone(roomSID: string): Promise<string> {
        //register url as a clone for this room
        let data = await this.room.clone(roomSID);
        let name = newName();
        await this.balancerDataBase.addCloneToDb(roomSID, data.hub_id, name);
        return data.url;
    }

    async computeUrl(urlIn: string): Promise<{
        url: string
    }> {
        let {roomSID} = this.parseUrl(urlIn);
        console.log("computeUrl on : " + roomSID);
        let instances: Instances = await this.balancerDataBase.getMetasForRoom(roomSID) || {
            roomSID,
            clones: {}
        } as any;
        if (!instances.roomSID) {
            throw new Error("invalid data from DB");
        }
        const mainRoomSid = instances.roomSID;
        if (!this.promises[mainRoomSid]) {
            this.promises[mainRoomSid] = new PromiseQueue<{ url: string }>();
        }
        //makes the user enter one at a time ensure the DB is updated and we have the right value for getRoomEntry
        return await this.promises[mainRoomSid].add(async () => {
            console.log("Request for balancing on : " + urlIn);
            let roomEntry = await this.room.getRoomEntry(roomSID);
            let maxLoad = roomEntry.room_size;
            let load = this.getPeopleCountWithFastCache(roomEntry);
            if (load >= maxLoad) {
                console.log("Try assigning to new room : " + load + "/" + maxLoad);
                const url = await this.computeRedirectUrl(roomSID, maxLoad, urlIn);
                //this.notifyFastCache(url);
                // no need to notify in this case since once we will reload the page the api will be trigger once
                // again this time hopefully accepting the room url and notifiying the fast cache
                return {url}
            } else {
                console.log("Accept current room : " + load + "/" + maxLoad + " : " + urlIn);
                this.notifyFastCache(urlIn);
                return {url: urlIn}//nominal case return this url
            }
        }).promise;
    }

    getPeopleCountWithFastCache(roomEntry: { id: string, member_count: number, lobby_count: number }): number {
        let ret = roomEntry.member_count + roomEntry.lobby_count;
        let time = performance.now();
        for (const localFastCacheKey in this.localFastCache) {
            if (+localFastCacheKey < (time - this.delayMs)) {
                delete this.localFastCache[localFastCacheKey];
            }
        }
        for (const localFastCacheKey in this.localFastCache) {
            const entry = this.localFastCache[localFastCacheKey];
            if (entry === roomEntry.id) {
                ret++;
            }
        }
        return ret;
    }

    notifyFastCache(url: string) {
        let {roomSID} = this.parseUrl(url);
        this.localFastCache[performance.now()] = roomSID;
    }

    async computeRedirectUrl(roomSID: string, maxLoad: number, urlIn: string): Promise<string> {
        //find a suitable clone (aka a clone with a reasonable load)
        let metasForRoom = await this.balancerDataBase.getMetasForRoom(roomSID) || {roomSID: roomSID, clones: {}};
        for (const key in metasForRoom.clones) {
            let roomEntry = await this.room.getRoomEntry(key);
            let load = this.getPeopleCountWithFastCache(roomEntry);
            if (load < maxLoad) {
                let url = urlIn.replace(roomSID, key);//url of the clone with the right origine
                console.log("Assigning to new room : " + load + "/" + maxLoad + " : " + url);
                return url;
            }
        }
        //at this point if no clone found create one
        let room = await this.createClone(roomSID);//new url
        console.log("Creating a new room : " + room);
        return room;
    }

}