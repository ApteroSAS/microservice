import {BalancerDB, balancerDB, BalancerDTO} from "@root/mongodb/LBModel";
import {properties} from "@root/properties/properties";
import {PromiseQueue} from "@root/service/loadbalancer/PromiseQueue";

export class LBDataBaseService {
    queue = new PromiseQueue<any>();

    async getMetasForRoom(roomSID: string): Promise<BalancerDTO> {
        if (properties.MONGODB === "DISABLED") {
            throw new Error("Mongo Disabled");
        }
        if (roomSID === "" || !roomSID) {
            throw new Error("wrong id :" + roomSID);
        }
        //https://mongoplayground.net/p/Nai8KB48PEX
        let searchExp = {
            $or: [
                {
                    roomSID: roomSID
                },
            ]
        }
        let serchExpRightOrPart: any = {};
        const searchKey = `clones.${roomSID}`
        serchExpRightOrPart[searchKey] = {
            $exists: true
        }
        searchExp.$or.push(serchExpRightOrPart);
        return this.queue.add(async () => {
            return await balancerDB.findOne(searchExp).exec() as BalancerDTO;
        }).promise;
    }

    async removeBalancerOn(roomSID: string): Promise<any> {
        if (properties.MONGODB === "DISABLED") {
            throw new Error("Mongo Disabled");
        }
        if (roomSID === "" || !roomSID) {
            throw new Error("wrong id :" + roomSID);
        }
        //https://mongoplayground.net/p/Nai8KB48PEX
        let searchExp = {
            $or: [
                {
                    roomSID: roomSID
                },
            ]
        }
        let serchexp2: any = {};
        const searchKey = `clones.${roomSID}`
        serchexp2[searchKey] = {
            $exists: true
        }
        searchExp.$or.push(serchexp2);
        return this.queue.add(async () => {
            return await balancerDB.deleteOne(searchExp).exec();
        }).promise;
    }

    async addCloneToDb(roomSIDParent: string, cloneSid: string, name: string): Promise<any> {
        if (properties.MONGODB === "DISABLED") {
            throw new Error("Mongo Disabled");
        }
        if (roomSIDParent === "" || !roomSIDParent) {
            throw new Error("wrong id :" + roomSIDParent);
        }
        if (cloneSid === "" || !cloneSid) {
            throw new Error("wrong id :" + cloneSid);
        }
        let room: BalancerDTO = await this.getMetasForRoom(roomSIDParent) || {'roomSID': roomSIDParent, clones: {}};
        const query = {'roomSID': roomSIDParent};
        room.clones[cloneSid] = {name}

        return this.queue.add(async () => {
            if (await balancerDB.findOne({roomSID: roomSIDParent}).exec()) {
                //update
                return balancerDB.updateOne(query, room);
            } else {
                //insert
                return await new BalancerDB(room).save();
            }
        }).promise;
    }

}