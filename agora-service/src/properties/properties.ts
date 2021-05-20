export function checkRequiredProperties(){
    if(process.env.PROD) {
        if (!process.env.AGORA_APPID) {
            throw new Error("process.env.AGORA_APPID");
        }
        if (!process.env.AGORA_APPCERT) {
            throw new Error("process.env.AGORA_APPCERT");
        }
    }
}

checkRequiredProperties();

export let properties = {
    AGORA_APPID: process.env.AGORA_APPID ? process.env.AGORA_APPID : "bd6b700ba492404ea1cad6587de4bbda",
    AGORA_APPCERT : process.env.AGORA_APPCERT ? process.env.AGORA_APPCERT : "2fe19b22379141f9ad453698209fce7c"
};