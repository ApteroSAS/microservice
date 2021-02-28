export function checkRequiredProperties(){
    if(process.env.PROD) {
        if (!process.env.MONGODB) {
            throw new Error("process.env.MONGODB");
        }
        if (!process.env.MAIL_SERVICE) {
            throw new Error("process.env.MAIL_SERVICE");
        }
    }
}

checkRequiredProperties();

export let properties = {
    MONGODB: process.env.MONGODB ? process.env.MONGODB : "mongodb+srv://dev:sjkPbH1zh78vdKRY@apteromain-h7nsw.mongodb.net/aptero-dev?retryWrites=true",
    MAIL_SERVICE: process.env.MAIL_SERVICE ? process.env.MAIL_SERVICE : "https://alphahub.aptero.co/service/mail",
};