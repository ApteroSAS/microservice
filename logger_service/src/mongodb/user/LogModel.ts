import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    timestamp: { type: Date, default: Date.now }
}, { strict: false });

export interface LogDTO extends Document{
    timestamp: Date,
}

export const LogModel = mongoose.model<LogDTO>("Log", LogSchema);
