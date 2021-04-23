import axios from "axios";
import {JWTAuth} from "@root/jwt/JWTAuth";

export default class PostgrestController {

    constructor(private jwtSecret: JWTAuth, private host: string) {
        if (!this.host.endsWith("/")) {
            this.host = host.replace(/\/$/, "");
        }
    }

    async upgradeHeaders(headers){
        let jwt = await this.jwtSecret.createPostgrestJWT();
        headers.authorization = `Bearer ${jwt}`;
    }

    async patch(headers, urlTail: string, data: any): Promise<any> {
        await this.upgradeHeaders(headers);
        return axios.patch(this.host + urlTail, data, {headers: headers});
    }

    async put(headers, urlTail: string, data: any): Promise<any> {
        await this.upgradeHeaders(headers);
        return axios.put(this.host + urlTail, data, {headers: headers});
    }

    async post(headers, urlTail: string, data: any) {
        await this.upgradeHeaders(headers);
        return axios.post(this.host + urlTail, data, {headers: headers});
    }

    async get(headers, urlTail: string) {
        await this.upgradeHeaders(headers);
        return axios.get(this.host + urlTail+"&select=*,id::text", {headers: headers, data: {}});
    }

    async delete(headers, urlTail: string): Promise<any> {
        await this.upgradeHeaders(headers);
        return axios.delete(this.host + urlTail, {headers: headers, data: {}});
    }
}