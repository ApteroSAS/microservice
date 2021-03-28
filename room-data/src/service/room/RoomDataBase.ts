import {roomDB, RoomDTO} from "@root/mongodb/RoomModel";


export default class RoomDataBase {

    constructor() {
        this.start();
    }

    start() {
    }

    findRoom(roomSID:string):Promise<RoomDTO>{
        return new Promise<RoomDTO>(async (resolve, reject) => {
            if (roomSID === "" || !roomSID) {
                reject("wrong id :" + roomSID);
                return;
            }
            //TODO create or update
            let result:any = await roomDB.findOne({roomSID: roomSID}).exec();
            resolve(result);
        });
    }


    onRoomUpdate(callback: (room) => void) {
        roomDB.watch().on('change', (data:any) =>{
            //console.log(new Date(), data)
            callback(data.fullDocument);
        });
    }

    async getRooms() {
        let ret = [];
        let documents = await roomDB.find({ });
        documents.forEach((document:any) => {
            ret.push(document._doc);
        });
        return ret
    }
}