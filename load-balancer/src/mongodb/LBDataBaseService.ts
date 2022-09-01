import {balancerDB, BalancerDTO} from "@root/mongodb/LBModel";
import {properties} from "@root/properties/properties";

export class LBDataBaseService{
    async getMetasForRoom(roomSID: string): Promise<BalancerDTO> {
        if (properties.MONGODB === "DISABLED") {
            throw new Error("Mongo Disabled");
        }
        if (roomSID === "" || !roomSID) {
            throw new Error("wrong id :" + roomSID);
        }
        return await balancerDB.findOne({roomSID: roomSID}).exec() as BalancerDTO;
    }

    async addCloneToDb(roomSIDParent: string,cloneSid:string,url:string): Promise<BalancerDTO> {
        if (properties.MONGODB === "DISABLED") {
            throw new Error("Mongo Disabled");
        }
        if (roomSIDParent === "" || !roomSIDParent) {
            throw new Error("wrong id :" + roomSIDParent);
        }
        if (cloneSid === "" || !cloneSid) {
            throw new Error("wrong id :" + cloneSid);
        }
        let room:BalancerDTO = await this.getMetasForRoom(roomSIDParent);
        const query = {'roomSID': roomSIDParent};
        room.clones[cloneSid] = {url}
        return balancerDB.updateOne(query, room, {upsert: true, setDefaultsOnInsert: true}) as any as BalancerDTO;
    }

}