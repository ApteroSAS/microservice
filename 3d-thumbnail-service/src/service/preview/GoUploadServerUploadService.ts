import * as fs from "fs";
const FormData = require('form-data')
import axios, {AxiosRequestConfig} from 'axios'
import * as Path from "path";

export interface UploadedDataInterface {
    fileURL: string,
    fileId: string,
}


export class GoUploadServerUploadService {
    constructor(private serverUrl:string,private token:string){

    }

    async uploadLocalFile(path:string, rename:string=""): Promise<UploadedDataInterface> {
        const folder = Path.resolve(path);
        let filename = rename===""?Path.basename(folder):rename+".png";
        let uploadUrl = this.serverUrl+"/upload/files/"+filename+"?token="+this.token;
        let fileUrl = this.serverUrl+"/upload/files/"+filename+"?token="+this.token;

        return await new Promise((resolve, reject) => {

            const form_data = new FormData();
            let stream = fs.createReadStream(folder);
            form_data.append('file', stream as any,{filename: filename, contentType: 'image/png', knownLength: stream.bytesRead});

            const request_config = {
                headers: {
                    //'Authorization': `Bearer ${access_token}`,
                    ...form_data.getHeaders()
                }
            };

            axios.post(uploadUrl, form_data, request_config).then(value => {
                resolve({
                    fileURL:fileUrl,
                    fileId:filename,
                })
            }).catch(reason => {
                reject(reason);
            });

        })
    }
}
