import {LogModel} from "@root/mongodb/user/LogModel";
import {properties} from "@root/properties/properties";
import cron from 'node-cron';

export interface LogData {
    timestamp?: Date,
    [key: string]: string|number|Date; // Allows additional properties of type string
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
        data.timestamp = new Date(data.timestamp || new Date());
        await LogModel.collection.insertOne(data);
    }

    async cleanUp(): Promise<void> {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - (+properties.LOG_RETENTION_DAYS || 365));

        await LogModel.collection.deleteMany({
            timestamp: {
                $lt: dateThreshold// Delete logs older than specified days
            }
        });
    }

}
