import {roomDB} from "@root/mongodb/RoomModel";

const {RoomModel} = require("../RoomModel")

export const resolvers = {
    Rooms: async () => {
        try {
            const roomsFetched = await roomDB.find()
            return roomsFetched.map(room => {
                room._doc["entities"] = room._doc["entities"].map(value=>{
                    return JSON.stringify(value);
                });
                return {
                    ...room._doc,
                    _id: room.id,
                }
            })
        } catch (error) {
            throw error
        }
    },

    createRoom: async args => {
        try {
            const { rid,entities } = args.Room
            const room = new RoomModel({
                rid,
                entities:entities.map(value=>{
                    return JSON.parse(value);
                })
            })
            const newroom = await room.save()
            return { ...newroom._doc, _id: newroom.id }
        } catch (error) {
            throw error
        }
    },
}