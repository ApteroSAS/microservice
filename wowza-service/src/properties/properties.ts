export let properties = {
    // https://www.wowza.com/docs/start-live-streaming-using-the-wowza-video-rest-api and https://auth.wowza.com/client/token-management
    TOKEN: process.env.TOKEN ? process.env.TOKEN : "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NTU3NzEwZS0yYzhlLTQ1MDgtOTEwOS1hZWMxNTEwODAxY2UiLCJqdGkiOiJiNzAyOTc1NjA4YTc0MjkxNmJmNzkxNGUwNTY3OTRlOGRhNjVjMWZkNmFjMDIzODE1MmUzZGUzY2U1ZDE5MzljNmZiZTc3YmM2MTczMjA0YSIsImlhdCI6MTY3Mjc2MDYzNCwibmJmIjoxNjcyNzYwNjM0LCJleHAiOjIzMDM5MTI2MzQsInN1YiI6Ik9VLWJhNzE0NWU3LTY4YmUtNDllOS1hMmZmLWJiM2RlZmQwZGE2NiJ9.HRKfSHipvi1Z4hKUU1WZEZPF96JsNtqhqKnDulUdkpfGoAXnmdEDLItZ94cj-G65MCajXTdjybT6EEoRYio1XG-peBHq2jTfVhGkMxN-ooU5HrIMPSSON2ZQrp5WOcWJsAlRNxLIuGeO0tbGX-iawmYdPpA2dD1cngR9TDlQMR_IXQP3iEqB6RJOt7KOZZSD73eJL5kuQCWHujBPhio38ck_FMrFZWySRzqT4qYNcqK4pekcw9miqISqeL_MxU5zzhP2MnsmH-Tp3Foe6l8J__QG1Ad5HDxs_xUp77oEFLoRBQEhhvWxR9o7QBogerY-Q05c5p3Mase0q2E1ctFRvTJ67BTRGuv5SxM08i1JyWnkdbxU4VZaauBUOrcB7p-3SBOu6sPGNgjghebzLmXnFniZPM0xPRSOUsSq9Nmwk4pkR5H9OvN-mPnV1sCZDVmOtevqXQt2lmFSvUQqko8hIRpS7B9mNDptOdHG-mk6ktMnu9SVem2UTgMKIRhqpqSny3vf23jqgBdNUKX7lwbWJyZcRvxwTIrwavkXOxt30qL8W8wq-VD9Bgp-iMCRmrWMJF6BgIon7Qe_kkOhH0sbLhPGiMWMSWwE2y5k9btAA6uJFQox72txLxq2Cr3BJ8Ip-0BSxrjTpiXjy-8A375i-CmwFYILyuYA6hGtHdFzObs"
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

