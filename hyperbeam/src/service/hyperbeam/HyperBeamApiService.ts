import express from 'express';
import axios from 'axios';
import {properties} from "@root/properties/properties";

export default class HyperBeamApiService {
    public expressApp;

    constructor() {
        if (!properties.HB_API_KEY) {
            throw new Error("properties.HB_API_KEY not defined");
        }
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        //must be high availability
        router.post('/computer', async (req, res) => {
            let json = req.body;

            let data = {
                "start_url": json.start_url || 'https://www.aptero.co',
                kiosk: json.kiosk || true,
                timeout: json.timeout || {
                    "absolute": json.absolute || 4 * 60 * 60,//seconds
                    "inactive": json.inactive || 30,//seconds
                    "offline": json.offline || 30,//seconds
                },
                "hide_cursor": json.hide_cursor || true,
                width: json.width || 1280,
                height: json.height || 720,
                max_area: json.max_area || 1920 * 1080,
                ...json //complete other fields with whatever is in json
            }

            try {
                //https://docs.hyperbeam.com/rest-api/dispatch/start-chromium-session
                const resp = await axios.post('https://engine.hyperbeam.com/v0/vm', data, {
                    headers: {'Authorization': `Bearer ${properties.HB_API_KEY}`}
                });
                res.send(resp.data)
            } catch (e) {
                if (e.response.data.code === "err_exceeded_vm_limit") {
                    console.log("exceeded vm limit, deleting all vms");
                    try {
                        const respList = await axios.get('https://engine.hyperbeam.com/v0/vm', {
                            headers: {'Authorization': `Bearer ${properties.HB_API_KEY}`}
                        });
                        const results: { id: string, creation_date: string }[] = respList.data.results;
                        for (let i = 0; i < results.length; i++) {
                            const result = results[i];
                            await axios.delete(`https://engine.hyperbeam.com/v0/vm/${result.id}`, {
                                headers: {'Authorization': `Bearer ${properties.HB_API_KEY}`}
                            });
                        }
                        const resp = await axios.post('https://engine.hyperbeam.com/v0/vm', data, {
                            headers: {'Authorization': `Bearer ${properties.HB_API_KEY}`}
                        });
                        res.send(resp.data);
                    } catch (e) {
                        console.error(e.response.data);
                        res.json(e);
                    }
                }else{
                    console.error(e.response.data);
                    res.json(e);
                }
            }

        });

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}

