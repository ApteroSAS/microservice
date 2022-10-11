let propertiesBase = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID : "ACaa6afb61ef00eaaa00f78bc0d1591333",
    TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID ? process.env.TWILIO_API_KEY_SID : "SKd92f2e21a3164476d35808b371ee9ba3",
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET ? process.env.TWILIO_API_KEY_SECRET : "AGovEb5MPDTinLcslPRw2cTcoJnj7jYi",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? process.env.TWILIO_AUTH_TOKEN : "90e00954ace89710a93df712c549e84a",
};

export function checkRequiredProperties(){
    if(process.env.PROD) {
        let toCheck = Object.keys(propertiesBase);
        for (const key of toCheck) {
            if (!process.env[key]) {
                throw new Error("process.env."+key+" not defined");
            }
        }
    }
}

checkRequiredProperties();

export const properties = propertiesBase;

