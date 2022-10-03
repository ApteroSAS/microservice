export let properties = {
    MONGODB: process.env.MONGODB ? process.env.MONGODB : "mongodb+srv://dev:sjkPbH1zh78vdKRY@apteromain-h7nsw.mongodb.net/aptero-dev?retryWrites=true",//or DISABLED
    MAIL_SERVICE: process.env.MAIL_SERVICE ? process.env.MAIL_SERVICE : "https://alphahub.aptero.co/service/mail",//or DISABLED
    ADMIN_TOKEN: process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN : "aptero"
};

export function checkRequiredProperties(){
    if(process.env.PROD) {
        for (const key in properties) {
            if (!process.env[key]) {
                throw new Error("process.env."+key+" not defined");
            }
        }
    }
}
checkRequiredProperties();

