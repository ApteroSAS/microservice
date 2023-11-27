import axios from "axios";
import {JWTAuth} from "@root/jwt/JWTAuth";

export default class PostgrestController {

    constructor(private jwtSecret: JWTAuth, private host: string) {
        if (!this.host.endsWith("/")) {
            this.host = this.host + "/";
        }
        //host = https://alphapostgrest.aptero.co/

    }

    async read(table: string): Promise<any> {
        //http://alphapostgrest.aptero.co/hubs
        let jwt = await this.jwtSecret.createPostgrestJWT();
        let headers = {
            authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json"
        };
        let resp = await axios.get(this.host + table, {headers: headers, data: {}});
        resp = resp.data;
        return resp;
    }

    /**
     * https://postgrest.org/en/v7.0.0/api.html
     * @param table
     * @param filter
     */
    async find(table: string,filter:string): Promise<any> {
        let jwt = await this.jwtSecret.createPostgrestJWT();
        let headers = {
            authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
            //"Accept": "application/vnd.pgrst.object+json",
            //"Prefer": "return=representation"
        };
        let resp = await axios.get(this.host + table + "?"+filter, {headers: headers, data: {}});
        resp = resp.data;
        return resp;
    }

    async update(table: string, filter: string, data: any): Promise<any> {
        let jwt = await this.jwtSecret.createPostgrestJWT();
        let headers = {
            authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.pgrst.object+json",
            "Prefer": "return=representation"
        };
        let resp = await axios.patch(this.host + table + "?" + filter, data, {headers: headers});
        resp = resp.data;
        return resp;
    }

    async insertOne(table: string, data: any): Promise<any> {
        let jwt = await this.jwtSecret.createPostgrestJWT();
        let headers = {
            authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.pgrst.object+json",
            "Prefer": "return=representation"
        };
        let resp = await axios.put(this.host + table, data, {headers: headers});
        resp = resp.data;
        return resp;
    }

    async insert(table: string, data: any): Promise<any> {
        let jwt = await this.jwtSecret.createPostgrestJWT();
        let headers = {
            authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json"
        };
        let resp = await axios.post(this.host + table, data, {headers: headers});
        resp = resp.data;
        return resp;
    }
}