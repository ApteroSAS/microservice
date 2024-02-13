// HyperbeamModel.ts
import mongoose, { Document, ObjectId } from "mongoose";

interface LogDTO extends Document {
    objIdentifier: string;
    sessionId: string;
    time: string;
}

const LogSchema = new mongoose.Schema({
    objIdentifier: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
}, { strict: false });

export const LogModel = mongoose.model<LogDTO>("HyperbeamLog", LogSchema);