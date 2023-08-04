import express from 'express';
import axios from 'axios';
import {properties} from "@root/properties/properties";

const API_URL = 'https://engine.hyperbeam.com/v0/vm';
const AUTH_HEADERS = { 'Authorization': `Bearer ${properties.HB_API_KEY}` };

export default class HyperBeamApiService {
    public expressApp;

    constructor() {
        if (!properties.HB_API_KEY) {
            throw new Error("properties.HB_API_KEY not defined");
        }
    }

    mountAPI() {
        let router = express.Router();
        let apiVersion = "1.0.0";

        router.get('/api/version', (req, res) => res.json(apiVersion));

        router.post('/computer', async (req, res) => {
            let json = req.body;
            let sessionActive = await this.checkSession(json.session);
            let resp;

            if (sessionActive) {
                resp = await this.retrieveSession(json.session);
            } else {
                resp = await this.createSession(json);

                if (resp.data.code === "err_exceeded_vm_limit") {
                    console.log("exceeded vm limit, deleting all vms");
                    await this.deleteAllVMs();
                    resp = await this.createSession(json);
                }
            }

            res.send(resp.data);
        });

        this.expressApp.use('/', router);
    }

    async checkSession(sessionId) {
        const respList = await axios.get(API_URL, { headers: AUTH_HEADERS });
        const results = respList.data.results;
        return results.some(result => result.id === sessionId);
    }

    async retrieveSession(sessionId) {
        return await axios.get(`${API_URL}/${sessionId}`, { headers: AUTH_HEADERS });
    }

    async createSession(json) {
        let data = this.buildSessionData(json);
        try {
            return await axios.post(API_URL, data, { headers: AUTH_HEADERS });
        } catch (e) {
            console.error(e.response.data);
            return e.response;
        }
    }

    async deleteAllVMs() {
        const respList = await axios.get(API_URL, { headers: AUTH_HEADERS });
        const results = respList.data.results;
        for (let result of results) {
            await axios.delete(`${API_URL}/${result.id}`, { headers: AUTH_HEADERS });
        }
    }

    buildSessionData(json) {
        return {
            "start_url": json.start_url || 'https://www.aptero.co',
            kiosk: json.kiosk || true,
            timeout: json.timeout || {
                "absolute": json.absolute || 4 * 60 * 60, //seconds
                "inactive": json.inactive || 30, //seconds
                "offline": json.offline || 30, //seconds
            },
            "hide_cursor": json.hide_cursor || true,
            width: json.width || 1280,
            height: json.height || 720,
            max_area: json.max_area || 1920 * 1080,
            ...json
        };
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }
}
