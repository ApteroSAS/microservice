import 'dotenv/config';

export let properties = {
    MONGODB: process.env.MONGODB,
    LOG_RETENTION_DAYS: process.env.LOG_RETENTION_DAYS,
    CLEANUP_CRON: process.env.CLEANUP_CRON,
};

export function checkRequiredProperties(){
    for (const key in properties) {
        console.log(key +" : "+process.env[key]);
    }
    if(process.env.PROD) {
        for (const key in properties) {
            if (!process.env[key]) {
                throw new Error("process.env."+key+" not defined");
            }
        }
    }
}
checkRequiredProperties();

