import express from 'express';
import axios from 'axios';
import {properties} from "@root/properties/properties";

import {PromiseQueue} from './PromiseQueue'; 

const API_URL = 'https://engine.hyperbeam.com/v0/vm';
const AUTH_HEADERS = { 'Authorization': `Bearer ${properties.HB_API_KEY}` };


/*
    Clear the Hyperbeam Session map every 5 minutes (Ignore if we are processing a request)
    This system is only intended to handle simultaneous requests for an object with an undefined session
    Once the session is defined, the object should retain the same session until all users leave the room
    (So users will request the Object for the session, not the API)
*/

export default class HyperBeamApiService {
    public expressApp;
    hb_objects = new Map();
    queue = new PromiseQueue();
    constructor() {
        if (!properties.HB_API_KEY) {
            throw new Error("properties.HB_API_KEY not defined");
        }
    }

    mountAPI() {
        let router = express.Router();
        let apiVersion = "1.0.1";

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

        /*
            "/objcomputer" is used to return a consistent Hyperbeam session for 3D Screens in Hubs:
            This is because multiple users will ask for a session for the same object, and we
            want them to share the same session per object.
        */
        //var requesting = false;
        router.post('/objcomputer', async (req, res) => {
            // Queue the request to avoid multiple requests for the same object
            const { promise } = this.queue.add(async () => {
                let json = req.body;
                let sessionActive = await this.checkSession(json.session);
                let objIdentifier = json.objid;
                let resp;

                if (sessionActive) {
                    resp = await this.retrieveSession(json.session);
                } else {
                    let mapSession = null;

                    if (objIdentifier)
                    {
                        mapSession = this.hb_objects.get(objIdentifier);
                        console.log("mapSession",mapSession);
                        if (mapSession && await this.checkSession(mapSession)) {
                            // If found, return the session
                            resp = await this.retrieveSession(mapSession);
                        } else {
                            // If not found, create a new session and register it for this object
                            resp = await this.createSession(json);
                            if (resp.data.code !== "err_exceeded_vm_limit") {
                                this.hb_objects.set(objIdentifier, resp.data.session_id);
                                console.log("|NEW----hb_objects",this.hb_objects);
                            }
                        }
                        
                    } else {
                        resp = await this.createSession(json);
                    }
                    if (resp.data.code === "err_exceeded_vm_limit") {
                        console.log("exceeded vm limit, ignoring");
                        resp.data = {session_id: null};
                    }
                }

                return resp.data;
            });
            
            promise.then(data => {
                res.send(data);
              }).catch(e=>{
                console.error("Error 500",e)
                res.status(500).send({session_id: null}); // handle error
              });
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

        setInterval(() => {
            if (this.queue.getQueueSize() === 0) {
                this.hb_objects.clear();
            }
        }, 5 * 60 * 1000);
    }
}
