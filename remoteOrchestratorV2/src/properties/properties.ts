export function checkRequiredProperties(){
    if(process.env.PROD) {
        if (!process.env.AWS_CRED_PATH) {
            throw new Error("process.env.AWS_CRED_PATH");
        }
        if (!process.env.DEFAULT_APP_ID) {
            throw new Error("process.env.DEFAULT_APP_ID");
        }
        if (!process.env.DEFAULT_STACK_NAME) {
            throw new Error("process.env.DEFAULT_STACK_NAME");
        }
        if (!process.env.DEFAULT_FLEET_NAME) {
            throw new Error("process.env.DEFAULT_FLEET_NAME");
        }
    }
}

checkRequiredProperties();

export let properties = {
    AWS_CRED_PATH: process.env.AWS_CRED_PATH ? process.env.AWS_CRED_PATH : "C:\\Users\\pierr\\Downloads\\aws_cred",
    DEFAULT_APP_ID: process.env.DEFAULT_APP_ID ? process.env.DEFAULT_APP_ID : "chrome-context",
    DEFAULT_STACK_NAME: process.env.DEFAULT_STACK_NAME ? process.env.DEFAULT_STACK_NAME : "FallBackStack",
    DEFAULT_FLEET_NAME: process.env.DEFAULT_FLEET_NAME ? process.env.DEFAULT_FLEET_NAME : "FallBackFleet",

};