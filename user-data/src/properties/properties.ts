import 'dotenv/config';

export let properties = {
    MONGODB: process.env.MONGODB,
    MAIL_SERVICE: process.env.MAIL_SERVICE,
    ADMIN_TOKEN: process.env.ADMIN_TOKEN,
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

