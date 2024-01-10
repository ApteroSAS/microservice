import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    time:{
        type: String,
        required: true
    },
}, { strict: false });

export interface LogDTO extends Document{
    time: string,
}

export const LogModel = mongoose.model<LogDTO>("Log", LogSchema);
