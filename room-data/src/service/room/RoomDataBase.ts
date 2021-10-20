import {roomDB, RoomDTO} from "@root/mongodb/RoomModel";
import {properties} from "@root/properties/properties";


export default class RoomDataBase {

    constructor() {
        this.start();
    }

    start() {
    }

    findRoom(roomSID:string):Promise<RoomDTO>{
        return new Promise<RoomDTO>(async (resolve, reject) => {
            if(properties.MONGODB==="DISABLED") {
                resolve({} as any);
                return;
            }
            if (roomSID === "" || !roomSID) {
                reject("wrong id :" + roomSID);
                return;
            }
            let result:any = await roomDB.findOne({roomSID: roomSID}).exec();
            resolve(result);
        });
    }

    findRoomByMongoId(mongoId:any):Promise<RoomDTO>{
        return new Promise<RoomDTO>(async (resolve, reject) => {
            if(properties.MONGODB==="DISABLED") {
                resolve({} as any);
                return;
            }
            if (!mongoId) {
                reject("wrong id :" + mongoId);
                return;
            }
            let result:any = await roomDB.findOne({_id: mongoId}).exec();
            resolve(result);
        });
    }

    onRoomUpdate(callback: (room,data) => void) {
        if(properties.MONGODB==="DISABLED") {
            return {} as any;
        }
        roomDB.watch().on('change', (data:any) =>{
            //console.log(new Date(), data)
            callback(data.fullDocument , data);
        });
    }

    async getRooms() {
        if(properties.MONGODB==="DISABLED") {
            return {} as any;
        }
        let ret = [];
        let documents = await roomDB.find({ });
        documents.forEach((document:any) => {
            ret.push(document._doc);
        });
        return ret
    }

    async updateRoom(roomSID: string, data: any) {
        if(properties.MONGODB==="DISABLED") {
            return {} as any;
        }
        let room:any = await this.findRoom(roomSID);
        const query = {'roomSID': roomSID};
        if(room) {
            Object.keys(data).forEach(key => {
                //shallow merge object
                data[key] = {...room[key], ...data[key]};
            });
        }
        data.roomSID = roomSID;//needs after merge
        return roomDB.updateOne(query, data, {upsert: true, setDefaultsOnInsert: true});
    }
}
