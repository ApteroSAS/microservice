export function checkRequiredProperties(){
    if(process.env.PROD) {
        let toCheck = Object.keys(properties);
        for (const key of toCheck) {
            if (!process.env[key]) {
                throw new Error("process.env."+key+" not defined");
            }
        }
    }
}

checkRequiredProperties();

export let properties = {
    MONGODB: process.env.MONGODB ? process.env.MONGODB : "mongodb+srv://dev:sjkPbH1zh78vdKRY@apteromain-h7nsw.mongodb.net/aptero-dev?retryWrites=true",
    RETICULUM_HOST: process.env.RETICULUM_HOST ? process.env.RETICULUM_HOST : "https://alphahub.aptero.co",
    POSTGREST_HOST: process.env.POSTGREST_HOST ? process.env.POSTGREST_HOST : "https://alphahub.aptero.co/service/db/postgrest",
    SOCKET_URL: process.env.SOCKET_URL ? process.env.SOCKET_URL : "wss://alphahub.aptero.co",
    //JWT_SECRET: process.env.JWT_SECRET ? process.env.JWT_SECRET : "47iqPEdWcfE7xRnyaxKDLt9OGEtkQG3SycHBEMOuT2qARmoESnhc76IgCUjaQIwX",
    JWT_SECRET: process.env.JWT_SECRET ? process.env.JWT_SECRET : "HS512CBBBBcfE7xRnyaxKDLt9OGEtkQG3SycHBEMOuT2qARmoESnhc76IgCUjaQIwY57iqPEdWcfE7xRnyaxKDLt9OGEtkQG3SycHBEMOuT2qARmoESnhc76IgCUjaQI",
    ADMIN_USER: process.env.ADMIN_USER ? process.env.ADMIN_USER : "640407050966269961",
    AUTO_OPENER_FEATURE: process.env.AUTO_OPENER_FEATURE ? process.env.AUTO_OPENER_FEATURE : "false",
};