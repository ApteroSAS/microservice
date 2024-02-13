// initializeDatabase.ts
import { startMongoose } from "@root/mongodb/MongooseService";
import { LogModel } from '@root/mongodb/log/HyperbeamModel';

export async function initializeDatabase(hb_objects: Map<string, string>) {
    try {
        // Connect to the database
        await startMongoose();
        console.log("Database connected");

        // Clear sessions older than 10 hours
        const cutoffTime = new Date(Date.now() - 10 * 60 * 60 * 1000); // 10 hours ago
        await LogModel.deleteMany({ time: { $lt: cutoffTime.toISOString() } });
        console.log("Older sessions cleared");

        // Load database information into the map
        const sessions = await LogModel.find({});
        sessions.forEach(session => {
            hb_objects.set(session.objIdentifier, session.sessionId);
        });
        console.log("Sessions loaded into map", hb_objects);
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
}
