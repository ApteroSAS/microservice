import {UnliEngineRoom} from "@root/unliEngine/UnliEngineRoom";

export default class UnliEngineRoomManager {
    rooms = {};

    createRoom(roomid: string, maxRadius: number = 0) {
        this.rooms[roomid] = new UnliEngineRoom(roomid, maxRadius);
        setInterval(() => {
            this.computeRooms()
        }, 1000);
    }


    async computeRooms() {
        Object.keys(this.rooms).forEach(key => {
            let room: UnliEngineRoom = this.rooms[key];
            room.compute().then(result => {
                console.log("Room key result : "+key);
                console.log("roomCreated : "+Object.keys(result.roomCreated).length);
                console.log("roomDeleted : "+Object.keys(result.roomDeleted).length);
                console.log("clientRoomChanged : "+Object.keys(result.clientRoomChanged).length)
                console.log("foreignCreated : "+Object.keys(result.foreignCreated).length)
                console.log("foreignRemoved : "+Object.keys(result.foreignRemoved).length)
            })
        })
    }

    deleteRoom(roomid: string) {
        delete this.rooms[roomid];
    }

    getRoom(roomid: string) {
        return this.rooms[roomid];
    }
}