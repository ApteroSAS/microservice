import 'dotenv/config';

export let properties = {
    MONGODB: process.env.MONGODB,
    MAIL_SERVICE: process.env.MAIL_SERVICE,
    ADMIN_TOKEN: process.env.ADMIN_TOKEN,
    RETICULUM_HOST: process.env.RETICULUM_HOST,
    POSTGREST_HOST: process.env.POSTGREST_HOST,
    SOCKET_URL: process.env.SOCKET_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    ADMIN_USER: process.env.ADMIN_USER,
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

