export function checkRequiredProperties(){
    if(process.env.PROD) {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error("process.env.SENDGRID_API_KEY");
        }
    }
}

checkRequiredProperties();

export let properties = {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY : "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",
};