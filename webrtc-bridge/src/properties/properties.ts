export function checkRequiredProperties(){
    if(process.env.PROD) {
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
    JWT_SECRET: process.env.JWT_SECRET ? process.env.JWT_SECRET : "HS512CBBBBcfE7xRnyaxKDLt9OGEtkQG3SycHBEMOuT2qARmoESnhc76IgCUjaQIwY57iqPEdWcfE7xRnyaxKDLt9OGEtkQG3SycHBEMOuT2qARmoESnhc76IgCUjaQI",
    ADMIN_USER: process.env.ADMIN_USER ? process.env.ADMIN_USER : "640407050966269961",
};