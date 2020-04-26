export let properties = {
    JSON_DB_STORAGE: process.env.JSON_DB_STORAGE ? process.env.JSON_DB_STORAGE : "tmp.json",
    UPLOAD_URL: process.env.UPLOAD_URL ? process.env.UPLOAD_URL : "rtmp://rtmp.aptero.co:1935/stream/",
    LIVE_URL: process.env.LIVE_URL ? process.env.LIVE_URL : "https://rtmp.aptero.co/live/",
    VERSION: "1.0.0"
};

export function checkRequiredProperties(){
    if(process.env.PROD) {
        Object.keys(properties).forEach(value => {
            if (!process.env[value] && value!=="VERSION") {
                throw new Error("process.env."+value);
            }
        });
    }
}

checkRequiredProperties();