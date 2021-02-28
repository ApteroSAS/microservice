export function checkRequiredProperties(){
    if(process.env.PROD) {
        if (!process.env.TWILIO_ACCOUNT_SID) {
            throw new Error("process.env.TWILIO_ACCOUNT_SID");
        }
        if (!process.env.TWILIO_API_KEY_SID) {
            throw new Error("process.env.TWILIO_API_KEY_SID");
        }
        if (!process.env.TWILIO_API_KEY_SECRET) {
            throw new Error("process.env.TWILIO_API_KEY_SECRET");
        }
    }
}

checkRequiredProperties();

export let properties = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID : "AC2b4884e41acc8b8ed9f7ee795969d76b",
    TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID ? process.env.TWILIO_API_KEY_SID : "SKd92f2e21a3164476d35808b371ee9ba3",
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET ? process.env.TWILIO_API_KEY_SECRET : "AGovEb5MPDTinLcslPRw2cTcoJnj7jYi",
};