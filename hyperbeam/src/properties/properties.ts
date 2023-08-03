export let properties = {
    HB_API_KEY: process.env.HB_API_KEY ? process.env.HB_API_KEY : "sk_test_H7em9njExb9HsEqf04MVsXxbGQSrSrNk8QiLlrc0POw", //https://hyperbeam.com/dashboard/
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

