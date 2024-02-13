import {LogModel} from "@root/mongodb/log/LogModel";
import {properties} from "@root/properties/properties";
import cron from 'node-cron';

export interface LogData {
    time?: string,
    [key: string]: string|number; // Allows additional properties of type string
}


export default class LoggerDataBase {

    constructor() {
        if(properties.CLEANUP_CRON !== "DISABLED") {
            cron.schedule(properties.CLEANUP_CRON, () => {
                this.cleanUp().catch((e)=>{
                    console.error(e);
                });
            });
        }
    }

    async trace<T extends LogData>(data: T):Promise<void> {
        data.time = data.time || new Date().toISOString()
        await LogModel.collection.insertOne(data);
    }

    async cleanUp(): Promise<void> {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - (+properties.LOG_RETENTION_DAYS || 365));

        await LogModel.collection.deleteMany({
            time: {
                $lt: dateThreshold.toISOString() // Delete logs older than specified days
            }
        });
    }

}
