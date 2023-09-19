export let properties = {
    DEFAULT_IMG: process.env.DEFAULT_IMG ? process.env.DEFAULT_IMG :"registry.aptero.co/chrome-renderer:latest",
    AGENT_LIST: process.env.AGENT_LIST ? process.env.AGENT_LIST : '{"pixis": {"url": "vm1.aptero.co/service/remote/orchestrator"}}',
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


