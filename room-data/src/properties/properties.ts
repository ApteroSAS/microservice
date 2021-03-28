export function checkRequiredProperties(){
    if(process.env.PROD) {
        if (!process.env.MONGODB_REPLICA_SET) {
            throw new Error("process.env.MONGODB");
        }
        if (!process.env.POSTGREST_HOST) {
            throw new Error("process.env.POSTGREST_HOST");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("process.env.JWT_SECRET");
        }
        if (!process.env.ADMIN_USER) {
            throw new Error("process.env.ADMIN_USER");
        }
    }
}

checkRequiredProperties();

export let properties = {
    MONGODB: process.env.MONGODB ? process.env.MONGODB : "mongodb+srv://dev:sjkPbH1zh78vdKRY@apteromain-h7nsw.mongodb.net/aptero-dev?retryWrites=true",
    POSTGREST_HOST: process.env.POSTGREST_HOST ? process.env.POSTGREST_HOST : "https://alphapostgrest.aptero.co/",
    //JWT_SECRET: process.env.JWT_SECRET ? process.env.JWT_SECRET : "47iqPEdWcfE7xRnyaxKDLt9OGEtkQG3SycHBEMOuT2qARmoESnhc76IgCUjaQIwX",
    JWT_SECRET: process.env.JWT_SECRET ? process.env.JWT_SECRET : "512qPEdWcfE7xRnyaxKDLt9OGEtkQG3SycHBEMOuT2qARmoESnhc76IgCUjaQIwY57iqPEdWcfE7xRnyaxKDLt9OGEtkQG3SycHBEMOuT2qARmoESnhc76IgCUjaQIwX",
    ADMIN_USER: process.env.ADMIN_USER ? process.env.ADMIN_USER : "640407050966269961",
};