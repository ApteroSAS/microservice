import {roomDB, RoomDTO} from "@root/mongodb/room/RoomModel";
import {properties} from "@root/properties/properties";


export default class RoomDataBaseService {

    sanitizeRoom(room: any): RoomDTO | null {
        if (!room) {
            return null;
        }
        if (room.length !== undefined) {
            if (room.length > 1) {
                console.error("room.length > 1");
            } else if (room.length === 1) {
                room = room[0];
            }
        }
        return {
            roomSID: room.roomSID,
            spatialSound: room.spatialSound,
            entryMode: room.entryMode,
            preferencesOverride: room.preferencesOverride,
            AppConfigOverride: room.AppConfigOverride,
            features: room.features,
            permission: room.permission,
            customButton: room.customButton,
        };
    }

    async findRoom(roomSID: string): Promise<RoomDTO> {
        if (properties.MONGODB === "DISABLED") {
            return ({} as any);
        }
        if (roomSID === "" || !roomSID) {
            throw new Error("wrong id :" + roomSID);
        }
        return this.sanitizeRoom(await roomDB.findOne({roomSID: roomSID}).exec());
    }

    async findRoomByMongoId(mongoId: string): Promise<RoomDTO> {
        if (properties.MONGODB === "DISABLED") {
            return ({} as any);
        }
        if (!mongoId) {
            throw new Error("wrong id :" + mongoId);
        }
        return this.sanitizeRoom(await roomDB.findOne({_id: mongoId}).exec());
    }

    onRoomUpdate(callback: (room, data) => void) {
        if (properties.MONGODB === "DISABLED") {
            return {} as any;
        }
        roomDB.watch().on('change', (data: any) => {
            //console.log(new Date(), data)
            callback(data.fullDocument, data);
        });
    }

    async getRooms() {
        if (properties.MONGODB === "DISABLED") {
            return {} as any;
        }
        let ret = [];
        let documents = await roomDB.find({});
        documents.forEach((document: any) => {
            ret.push(document._doc);
        });
        return ret
    }

    async updateRoomMongo(roomSID: string, data: any) {
        if (properties.MONGODB === "DISABLED") {
            return {} as any;
        }
        let room: any = await this.findRoom(roomSID);
        const query = {'roomSID': roomSID};
        if (room) {
            Object.keys(data).forEach(key => {
                //shallow merge object
                data[key] = {...room[key], ...data[key]};
            });
        }
        data.roomSID = roomSID;//needs after merge
        return roomDB.updateOne(query, data, {upsert: true, setDefaultsOnInsert: true});
    }
}
