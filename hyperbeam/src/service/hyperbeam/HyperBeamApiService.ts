import express, { response } from 'express';
import axios, { AxiosResponse } from 'axios';
import {properties} from "@root/properties/properties";

import {PromiseQueue} from './PromiseQueue'; 

const API_URL = 'https://engine.hyperbeam.com/v0/vm';
const AUTH_HEADERS = { 'Authorization': `Bearer ${properties.HB_API_KEY}` };

import { LogModel } from '@root/mongodb/log/HyperbeamModel';
import { startMongoose, stopMongoose } from '@root/mongodb/MongooseService';

// Console log only if we are running in localhost
function localLog(...args) {
    if (process.env.PROD) {
        return;
    }
    console.log(...args);
}

export default class HyperBeamApiService {
    public expressApp;
    hb_objects = new Map();
    queue = new PromiseQueue();
    clearTimer = null;
    lastActionTimestamp = Date.now();
    constructor() {
        if (!properties.HB_API_KEY) {
            throw new Error("properties.HB_API_KEY not defined");
        }
        startMongoose().catch(console.error);
    }

    async retrieveValidSession(objIdentifier: string) {
      const session = this.hb_objects.get(objIdentifier);
      if (!session) {
          return null; // No session found
      }
    
      const isValid = await this.checkSession(session);
      if (!isValid) {
          // Session is invalid or expired, remove it
          localLog("Session is invalid or expired, remove it: " + objIdentifier)
          await LogModel.deleteOne({ objIdentifier: objIdentifier, sessionId: session });

          this.hb_objects.delete(objIdentifier);
          return null;
      }
    
      return session;
    }

    async cleanup() {
      await stopMongoose();
      console.log('Cleanup complete, MongoDB disconnected');
    }

    async saveSession(objIdentifier: string, sessionId: string) {
        const session = new LogModel({ objIdentifier, sessionId, time: new Date().toISOString() });
        await session.save();
    }


    mountAPI() {
        let router = express.Router();
        let apiVersion = "1.0.2";

        router.get('/api/version', (req, res) => res.json(apiVersion));

        router.post('/computer', async (req, res) => {
            let json = req.body;
            let sessionActive = await this.checkSession(json.session);
            let resp;

            try {
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
            } catch (e) {
                console.error(e);
                res.status(501);
                res.send({ message: e.message });
                return;
            }
            
            res.send(resp.data);
        });
        
        router.post('/stopcomputer', async (req, res) => {
        
            let { session_id } = req.query;
            let resp;

            // Check if the session is active
            try {
                let sessionActive = await this.checkSession(session_id);
                if (sessionActive) {
                    // If active, delete it
                    try {
                        resp = await axios.delete(`${API_URL}/${session_id}`, { headers: AUTH_HEADERS });
                    } catch (e) {
                        console.error(e.response.data);
                        resp = e.response;
                    }

                } else {
                    // If not active, return a 404
                    console.log("Session not found: " + session_id)
                    res.status(404);
                    res.send({ message: "Session not found: " + session_id});
                    return;
                }
            } catch (e) {
                console.error(e);
                res.status(501);
                res.send({ message: e.message });
                return;
            }

            res.send(resp.data);
        });

        /*
            "/objcomputer" is used to return a consistent Hyperbeam session for 3D Screens in Hubs:
            This is because multiple users will ask for a session for the same object, and we
            want them to share the same session per object.
            It is used both by Elements made in Hubs and Opal.
        */
        router.post('/objcomputer', async (req, res) => {
            // Queue the request to avoid multiple requests for the same object
            const { promise } = this.queue.add(async () => {
                let json = req.body;
                let sessionActive = json.session ? await this.checkSession(json.session) : null;
                let objIdentifier = json.objid;

                if (json.profile && Object.keys(json.profile).length !== 0 && (json.profile.load || json.profile.save)) {
                    // FIRST: Send a session from an object if already defined in our list
                    if (objIdentifier) {
                        localLog("objIdentifier Defined: " + objIdentifier)
                        let mapSession = this.hb_objects.get(objIdentifier);
                        if (mapSession) {
                            localLog("mapSession Defined: " + mapSession)
                            // If found, return the session
                            let session = await this.retrieveValidSession(objIdentifier);
                            if (session) {
                                // If found, return the session
                                let resp = await this.retrieveSession(session);
                                return resp.data;
                            }
                        }

                    }

                    // If not, we create one
                    let resp: AxiosResponse<any, any>;
                    try {
                        try {
                            resp = await axios.post(API_URL, json, { headers: AUTH_HEADERS });
                        } catch (e) {
                            console.error(e.response.data);
                            resp = e.response;
                        }
                    }
                    catch (e) {
                        console.error(e);
                        res.status(501);
                        res.send({ message: e.message });
                        return;
                    }
                        
                    return resp.data;
                } else {
                    console.log("----->No profile", json.profile);
                    delete json.profile;
                }

                // Handle in-Meet created elements
                let resp;
                if (sessionActive) {
                    resp = await this.retrieveSession(json.session);
                } else {
                    let mapSession = null;
                    if (objIdentifier) {
                        let addnew = true;
                        mapSession = this.hb_objects.get(objIdentifier);
                        if (mapSession) {
                            localLog("mapSession Defined: " + mapSession)
                            // If found, return the session
                            let session = await this.retrieveValidSession(objIdentifier);
                            if (session) {
                                // If found, return the session
                                addnew = false;
                                let resp = await this.retrieveSession(session);
                                return resp.data;
                            }
                        } 
                        
                        if (addnew) {
                            // If not found, create a new session and register it for this object
                            resp = await this.createSession(json);
                            if (resp.data.code !== "err_exceeded_vm_limit" && resp.data.session_id) {
                                this.hb_objects.set(objIdentifier, resp.data.session_id);
                                if (objIdentifier.startsWith('universal')) {
                                    // If it starts with 'universal', save it to the DB
                                    await this.saveSession(objIdentifier, resp.data.session_id); // Save to DB
                                }
                                console.log("|NEW!----hb_objects", this.hb_objects);
                            }

                        }
                    } else {
                        resp = await this.createSession(json);
                    }

                    if (resp.data.code === "err_exceeded_vm_limit") {
                        console.log("exceeded vm limit, ignoring");
                        resp.data = {session_id: null};
                    }
                    if (!resp.data.session_id) {
                        console.log("no session_id, ignoring");
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
            
            // Clear the list after 20 seconds of inactivity
            
            if (this.clearTimer - Date.now() <= 20 * 1000) {
                clearTimeout(this.clearTimer);
                this.clearTimer = setTimeout(async () => {
                    if (this.queue.getQueueSize() === 0 && this.clearTimer) {
                        clearTimeout(this.clearTimer); // Clear the existing timer
                    }
                    console.log("Clearing list");
                    // Iterate through the hb_objects Map
                    for (const [objIdentifier, sessionId] of this.hb_objects.entries()) {
                        if (objIdentifier.startsWith('universal')) {
                          // If it starts with 'universal', delete all sessions older than 10 hours
                          const cutoffTime = new Date(Date.now() - 10 * 60 * 60 * 1000); // 10 hours ago
                          await LogModel.deleteMany({ 
                              objIdentifier, 
                              time: { $lt: cutoffTime.toISOString() } 
                          });
                        } else {
                            // If it does not start with 'universal', delete the session
                            this.hb_objects.delete(objIdentifier);
                            localLog(`Deleted session for objIdentifier: ${objIdentifier}`);
                        }
                    }
                }, 30 * 1000); // 30 seconds in milliseconds
            }
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
