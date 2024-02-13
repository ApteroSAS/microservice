export interface Env {
    // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
    //roomBalancer: KVNamespace;
    //
    // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
    roomBalancerDO: DurableObjectNamespace;
    //
    // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
    // MY_BUCKET: R2Bucket;
}

/**
 * The max execution time for a Cloudflare Workers script on a single request is 30 seconds for paid plans. For free plans, the limit is shorter. Keep in mind that this limit applies to the execution time of the script itself and does not include the time spent waiting for responses from network requests or other asynchronous tasks.
 const MAX_EXECUTION_TIME_MS = 30 * 1000;
 */

/**
 * Entry point for the Worker.
 */
export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        ctx.passThroughOnException();
        return new RoomBalancer(request, env, ctx).getResponse();
        //return new Response(new Headers(request.headers).get("cache-control"));
    },
};

interface Instances {
    roomSID: string,
    updateTime: number,
    clones: {
        [id: string]: {//id:RoomSID
            url: string,
            name: string,
            people: number,
            peopleMax: number,
            main?: boolean,
            current: boolean,
        }
    },
}

interface CloneInstance {
    url: string,
    name: string,
    people: number,
    peopleMax: number,
    main?: boolean,
    current: boolean,
    updateTime: number,
    parentRoomSID: string,
    brothers: string[]
}

function parseUrl(url: string): { origin: string, roomSID: string } {
    //https://alphahub.aptero.co/fTj63Hg/room?msteams=true&embed_token=846d38e7d0bc3c49716f5f5cb2577ff8
    let urlObj = new URL(url);

    if (urlObj.origin.startsWith("https://localhost")) {
        return {
            origin: urlObj.origin,
            roomSID: urlObj.searchParams.get("hub_id") || "",
        };
    } else {
        return {
            origin: urlObj.origin,
            roomSID: urlObj.pathname.split("/")[1],
        };
    }
}

const COMPUTE_URL = "COMPUTE_URL";

export class RoomBalancerDurableObject {
    private metaDataCacheTTL = 1 * 60 * 1000;//ms must correspond to the minimum time a user will stay in the room (we do not compute disconnected)

    // @ts-ignore
    constructor(private state, env) {
        //this.state.storage.set(new Date().getTime() + 24*60*60*1000) //cleanup in 24 hour
    }

    /**
     * Entrypoint for the Durable Object.
     * @param request
     */
    async fetch(request: Request): Promise<Response> {
        let json = await request.json() as any;
        let fct = json.fct;
        const url = new URL(request.url);
        const urlString = url.origin + url.pathname;//remove search params
        switch (fct) {
            case "ping":
                return new Response(JSON.stringify("pong"));
            case "reset":
                await this.state.storage.deleteAll();
                return new Response(JSON.stringify("done"));
            case "entry":
                const {roomSID} = parseUrl(urlString);
                return new Response(JSON.stringify((await this.state.storage.get(roomSID)) || "empty"));
            case "entry2":
                return await this.state.storage.transaction(async (txn: DurableObjectTransaction) => {
                    const roomEntry = await this.getEntry(urlString, txn);
                    return new Response(JSON.stringify(roomEntry));
                });
            case "list":
                return new Response(JSON.stringify(Object.fromEntries(await this.state.storage.list())));
            case "enter":
            case COMPUTE_URL:
                const outputUrl = await this.computeRoomURL(urlString) + url.search;//Add search params again
                return new Response(JSON.stringify(outputUrl));
            default:
                throw new Error();
        }
    }

    async createClone(roomUrl: string, txn: DurableObjectTransaction): Promise<string> {
        let {origin} = parseUrl(roomUrl);
        const res = await fetch(origin + "/service/loadbalancer/clone?url=" + roomUrl, {
            cf: {
                //no cache on room balancer query
                cacheTtl: 0,
                cacheTtlByStatus: {"200-299": 0, 404: 0, "500-599": 0}
            }
        });
        //update instance cache
        const newurl = await res.json() as string;
        let {roomSID} = parseUrl(newurl);
        await this.updateRoomFromOrigin(newurl, txn, roomSID);//Only add entry for the new room;
        return newurl;
    }

    async getMetasForRoom(roomUrl: string): Promise<Instances> {
        let {origin, roomSID} = parseUrl(roomUrl);
        //https://alphahub.aptero.co/service/loadbalancer/meta?url=https%3A%2F%2Falphahub.aptero.co%2FzdBzwbV%2Fwowza-live-stream-test
        const res = await fetch(origin + "/service/loadbalancer/meta?url=" + roomUrl, {
            cf: {
                //no cache on room balancer query
                cacheTtl: 0,
                cacheTtlByStatus: {"200-299": 0, 404: 0, "500-599": 0}
            }
        });
        return (await res.json()) || {roomSID, clones: {}};
    }

    async getEntry(url: string, txn: DurableObjectTransaction): Promise<CloneInstance> {
        const {roomSID} = parseUrl(url);
        //use cache
        const instance = await txn.get(roomSID, {noCache: false}) as CloneInstance;
        //manual cache management
        //ensure latest data - return entire instance - non blocking
        if (instance) {
            if ((instance.updateTime + this.metaDataCacheTTL) < (new Date().getTime())) {
                return await this.updateRoomFromOrigin(url, txn);
            } else {
                return instance;
            }
        } else {
            //cache miss fetch the data
            return await this.updateRoomFromOrigin(url, txn);
        }
    }

    private async updateRoomFromOrigin(url: string, txn: DurableObjectTransaction, onlyRoomSID: string = ""): Promise<CloneInstance> {
        const {roomSID} = parseUrl(url);
        const metasForRoom: Instances = await this.getMetasForRoom(url);
        let putAll: { [id: string]: CloneInstance } = {};
        for (const metasForRoomKey in metasForRoom.clones) {
            const clone = metasForRoom.clones[metasForRoomKey];
            (clone as any).updateTime = new Date().getTime();
            (clone as any).parentRoomSID = metasForRoom.roomSID;
            (clone as any).brothers = Object.keys(metasForRoom.clones);
            putAll[metasForRoomKey] = clone as CloneInstance;
        }
        if (onlyRoomSID) {
            //only update one
            await txn.put(onlyRoomSID, putAll[onlyRoomSID], {noCache: false});
        } else {
            await txn.put(putAll, {noCache: false});
        }
        return putAll[roomSID];
    }

    async computeRedirectUrl(clonesKeys: string[], maxLoad: number, urlIn: string, txn: DurableObjectTransaction): Promise<(string | null)> {
        //find a suitable clone (aka a clone with a reasonable load)
        for (const cloneRoomSID of clonesKeys) {
            const clone = await txn.get(cloneRoomSID) as CloneInstance;
            if (!clone) {
                throw new Error("key not found :" + cloneRoomSID)
            }
            let load = clone.people;
            if (load < maxLoad) {
                //console.log("Assigning to new room : " + load + "/" + maxLoad + " : " + url);
                //url of the clone with the right origin
                const {roomSID} = parseUrl(urlIn);
                return urlIn.replace(roomSID, cloneRoomSID);
            }
        }
        return null;
    }

    /*this is the main function*/
    async computeRoomURL(urlIn: string): Promise<string> {
        return await this.state.storage.transaction(async (txn: DurableObjectTransaction) => {
            //await new Promise((resolve) => setTimeout(resolve, MAX_EXECUTION_TIME_MS));//TEST to see the compute time limite of the worker
            const roomEntry = await this.getEntry(urlIn, txn);
            const maxLoad = roomEntry ? roomEntry.peopleMax : 15;
            const load = roomEntry ? roomEntry.people : 0;
            const delta = maxLoad >= 8 ? 2 : 0;//margin of empty space
            let clonesKeys = roomEntry ? roomEntry.brothers : [];
            if (load >= (maxLoad - delta)) {
                //console.log("Try assigning to new room : " + load + "/" + maxLoad);
                let outputUrl = await this.computeRedirectUrl(clonesKeys, maxLoad, urlIn, txn);
                if (outputUrl == null) {
                    //at this point if no clone found create one
                    //console.log("Creating a new room : " + room);
                    outputUrl = await this.createClone(urlIn, txn);
                }
                //add +1user on this url do not wait write
                this.notifyCount(outputUrl, txn).then(() => {
                });
                return outputUrl;
            } else {
                //console.log("Accept current room : " + load + "/" + maxLoad + " : " + urlIn);
                //add +1user on this url do not wait write
                this.notifyCount(urlIn, txn).then(() => {
                });
                return urlIn;
            }
        })
    }

    private async notifyCount(urlIn: string, txn: DurableObjectTransaction): Promise<string> {
        const {roomSID} = parseUrl(urlIn);
        const instance = await txn.get(roomSID, {noCache: false}) as CloneInstance;
        instance.people++;
        await txn.put(roomSID, instance, {noCache: false});
        return urlIn;
    }
}

class RoomBalancer {
    private roomBalancerDO: DurableObjectStub;
    private targetUrl: string = "";

    constructor(
        private request: Request,
        private env: Env,
        private ctx: ExecutionContext) {
        this.roomBalancerDO = env.roomBalancerDO.get(env.roomBalancerDO.idFromName("counter"));
    }

    /**
     * Entrypoint for the Worker.
     */
    public async getResponse() {
        const url = new URL(this.request.url);
        const {pathname, search} = url;
        let host = "https://alphahub.aptero.co"
        const headers = new Headers(this.request.headers);
        if (headers.get("fetchhost")) {
            host = "https://" + headers.get("fetchhost");
        }
        this.targetUrl = host + pathname + search;

        //if href don't have a room format (http://127.0.0.1:8787/cvQqMeF/room) just forward the request but with cache
        if (pathname.split("/").length < 3 || pathname.indexOf(".") !== -1) {
            //console.log("assets cache " + this.targetUrl);
            return this.fetchWithCache(this.targetUrl, this.request);
        }

        if (url.searchParams.get("debug")) {
            // see readme for more info
            return new Response(JSON.stringify(await this.execDurableObject(this.targetUrl, url.searchParams.get("debug") as string)));
        }

        let offline = url.searchParams.get("offline2") === "true"
            || url.searchParams.get("offline") === "true"
            || url.searchParams.get("nolb") === "true";
        const isGet = this.request.method === "GET";
        if (offline || !isGet) {
            //exception to load-balancer
            const response = await this.fetchWithCache(this.targetUrl, this.request);
            response.headers.set("fetchhost", headers.get("fetchhost") || "error");
            return response;
        } else {
            const response = await this.computeRoomBody(this.targetUrl, this.request);
            response.headers.set("fetchhost", headers.get("fetchhost") || "error");
            return response;
        }
        //return fetchRoomBody(targetUrl);
    }

    /**
     * bridge function to durable object see RoomBalancerDurableObject
     * @param urlIn
     * @param fct
     */
    async execDurableObject<T>(urlIn: string, fct: string): Promise<T> {
        return await (await this.roomBalancerDO.fetch(urlIn, {
            method: 'POST',
            headers: {
                dataObjectRequest: fct//to identify request in log
            },
            body: JSON.stringify({
                fct: fct,
            }), cf: {
                //No cache for room durable object
                cacheTtl: 0,
                cacheTtlByStatus: {"200-299": 0, 404: 0, "500-599": 0}
            }
        })).json();
    }

    async fetchWithCache(targetUrl: string, request: Request) {
        //this request is cached every minutes
        const headers = new Headers(request.headers);
        headers.set("x-room-balancer", "true");
        let cf;
        //https://developers.cloudflare.com/workers//runtime-apis/request#requestinitcfproperties
        //https://developers.cloudflare.com/cache/about/default-cache-behavior/#cloudflare-cache-responses
        let cached;
        if (headers.get("cache-control") == "no-cache") {
            await caches.default.delete(request);
            await caches.default.delete(targetUrl);
            cf = {
                cacheTtl: 0,
                cacheTtlByStatus: {"200-299": 0, 404: 0, "500-599": 0}
            }
            cached=false;
        } else {
            cf = {
                /*
                Edge Cache TTL
                Specify how long to cache a resource in the Cloudflare edge network. Edge Cache TTL isn't visible in response headers.  The minimum Edge Cache TTL depends on plan type:
                Free - 2 hours
                Pro - 1 hour
                Business - 1 second
                Enterprise - 1 second
                 */
                cacheEverything: true,
                cacheTtl: 60 * 60,
                cacheTtlByStatus: {"200-299": 60 * 60, 404: 0, "500-599": 0}//// for a max of X seconds before revalidating the resource
            }
            cached=true;
        }

        const res = await fetch(targetUrl, {
            body: request.body,
            headers: headers,
            method: request.method,
            redirect: "manual",
            cf
        });
        if (res.status !== 200) {
            //remove caches
            await caches.default.delete(request);
            await caches.default.delete(targetUrl);
            cached = false;
        }
        const responseHeaders = new Headers(res.headers);
        responseHeaders.set("cf-worker-cache",""+cached);
        return new Response(res.body, {status: res.status, statusText: res.statusText, headers: responseHeaders});
    }

    async computeRoomBody(urlIn: string, request: Request): Promise<Response> {
        console.log("computeRoomBody", urlIn);
        try {
            // Attempt to fetch the computed room URL
            const computedRoomUrl = await this.execDurableObject<string>(urlIn, COMPUTE_URL);
            return await this.fetchWithCache(computedRoomUrl, request);
        } catch (e) {
            console.error("Error in computeRoomBody", e);
            return await this.fetchWithCache(urlIn, this.request);
        }
    }

}
