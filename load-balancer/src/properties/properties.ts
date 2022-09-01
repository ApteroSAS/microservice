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
    ROOM_SERVICE: process.env.ROOM_SERVICE ? process.env.ROOM_SERVICE : "https://alphahub.aptero.co/service/room/",
    MAX_LOAD: process.env.MAX_LOAD ? process.env.MAX_LOAD : "24",
};