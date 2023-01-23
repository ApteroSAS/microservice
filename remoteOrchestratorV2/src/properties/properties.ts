export let properties = {
    DEFAULT_IMG:"registry.aptero.co/web-renderer-v2:latest"
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


