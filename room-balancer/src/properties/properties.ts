export let properties = {
    MONGODB: process.env.MONGODB ? process.env.MONGODB : "mongodb+srv://dev:sjkPbH1zh78vdKRY@apteromain-h7nsw.mongodb.net/aptero-dev?retryWrites=true",
    ROOM_SERVICE: process.env.ROOM_SERVICE ? process.env.ROOM_SERVICE : "https://alphahub.aptero.co/service/room/",
    ADMIN_TOKEN: process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN : "xRnyaxKDL",
    ROOM_SERVICE_ADMIN_TOKEN: process.env.ROOM_SERVICE_ADMIN_TOKEN ? process.env.ROOM_SERVICE_ADMIN_TOKEN : "xRnyaxKDLt9OGEtkQG3SycHB",

};

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

