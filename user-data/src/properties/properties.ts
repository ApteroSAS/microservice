export function checkRequiredProperties(){
    if(process.env.PROD) {
        if (!process.env.MONGODB) {
            throw new Error("process.env.MONGODB");
        }
    }
}

checkRequiredProperties();

export let properties = {
    MONGODB: process.env.MONGODB ? process.env.MONGODB : "mongodb+srv://dev:sjkPbH1zh78vdKRY@apteromain-h7nsw.mongodb.net/aptero-dev?retryWrites=true",
};