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

export let properties = {
    FILE_3D_TMP_STORAGE: process.env.FILE_3D_TMP_STORAGE ? process.env.FILE_3D_TMP_STORAGE : "",
    UPLOAD_SERVER_URL: process.env.UPLOAD_SERVER_URL ? process.env.UPLOAD_SERVER_URL : "https://alphahub.aptero.co",
    UPLOAD_SERVER_TOKEN: process.env.UPLOAD_SERVER_TOKEN ? process.env.UPLOAD_SERVER_TOKEN : "f9403fc5f537b4ab332d",
    VERSION: "1.0.0"
};