export let properties = {
    HB_API_KEY: process.env.HB_API_KEY ? process.env.HB_API_KEY : "sk_test_cJ_DPpKvlOlDqRYsuvfPAPO0v1vRe7hy1vjCFfMii-E", //https://hyperbeam.com/dashboard/
    MONGODB: process.env.MONGODB || "DISABLED",
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

