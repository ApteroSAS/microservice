import {properties} from "@root/properties/properties";
import {RoomGateway} from "@root/logic/RoomGateway";
import {LBDataBaseService} from "@root/mongodb/LBDataBaseService";

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
        throw new Error();
        //return true;
    }

    async getEntry(url: string) {
        let {roomSID} = this.parseUrl(url);
        return this.room.getRoomEntry(roomSID);
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

    async createCloneUrl(url: string): Promise<string> {
        const {roomSID} = this.parseUrl(url);
        return this.createClone(roomSID);
    }

    async createClone(roomSID: string): Promise<string> {
        //register url as a clone for this room
        let data = await this.room.clone(roomSID);
        let name = newName();
        await this.balancerDataBase.addCloneToDb(roomSID, data.hub_id, name);
        //notify default room
        await this.room.triggerRoomUpdate(roomSID);
        return data.url;
    }

    async applyDefaultRoomChangeToOtherInstances(url: string) {
        const instances = await this.getMetaForRoom(url);
        for (const clonesKey in instances.clones) {
            if (clonesKey === instances.roomSID) {
                continue;
            }
            await this.room.copyRoomParams(instances.roomSID,clonesKey);
        }
        return "done";
    }

    async allocate(url: string, number: number): Promise<any> {
        let ret: any = {};
        const instances = await this.getMetaForRoom(url);
        ret.instances = instances;
        ret.clonesCreated = [];
        const alreadyAllocatedRoom = (Object.keys(instances.clones).length);//for the default room
        const pplPerRoom = instances.clones[instances.roomSID].peopleMax;//get the default room
        let numberToAllocate = number - (alreadyAllocatedRoom * pplPerRoom);
        let roomNumberToAllocate = Math.ceil(numberToAllocate / pplPerRoom);
        for (let i = 0; i < roomNumberToAllocate; i++) {
            ret.clonesCreated.push(await this.createClone(instances.roomSID));
        }
        return ret;
    }
}