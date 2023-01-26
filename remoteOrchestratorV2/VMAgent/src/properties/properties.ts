export let properties = {
    VISIBLE_HOST: process.env.VISIBLE_HOST ? process.env.VISIBLE_HOST :"vm1.aptero.co",
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


