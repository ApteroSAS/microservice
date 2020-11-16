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
            let result = await roomDB.findOne({roomSID: roomSID}).exec();
            resolve(result);
        });
    }


}