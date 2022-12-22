/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/

 Worker used to replace the load balancer logic directly into cloudflare for improved performance
 https://developers.cloudflare.com/workers/examples/redirect/ <= use 302 redirect
 https://rockcontent.com/blog/301-vs-302-redirect/#:~:text=for%20more%20information%3A-,What%20is%20a%20302%20Redirect%3F,suggest%20using%20a%20302%20redirect.
 https://developers.cloudflare.com/workers/examples/cache-api/
 Workflow meet.aptero.co => Worker => if room type loadbalancer logic else just redirect (see pptx for more details)

 #Worker Ngingx config for cloudflare room balancer
 #https://nginx.viraptor.info/
 location ~ "^/[0-9a-zA-Z]{7}/" {
        #https://www.hostinger.com/tutorials/nginx-redirect/#:~:text=Get%20VPS%20Hosting-,Temporary%20and%20Permanent%20Nginx%20Redirect%20Explained,temporary%20movement%20of%20a%20page.
        #Don't use any non-rewrite directives inside if directives. Because if directive is essentially part of rewrite module.
        if ($http_x_room_balancer) { #x-room-balancer header
            #normal forward of the request
            proxy_pass http://10.11.0.6;
            break;
        }
        #send to worker
        proxy_set_header fetchhost $host;
        proxy_pass http://room-balancer.aptero.workers.dev;
    }
 */

//https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/

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

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        return new RoomBalancer(request, env, ctx).getResponse();
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

function getRoomEntry(instances: Instances, roomUrl: string): {
    people: number,
    peopleMax: number,
} {
    try {
        let {roomSID} = parseUrl(roomUrl);
        return instances.clones[roomSID];
    } catch (e) {
        return {people: 0, peopleMax: 15};
    }
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

const GET_META = "GET_META";
const CLONE = "CLONE";
const ADD_USER = "ADD_USER";

export class RoomBalancerDurableObject {
    private instances: { [id: string]: Instances } = {};//id = roomSID - Parent room not the room SID of the clones
    //API to get member count is too slow this will be used instead. In addition even if we call the api the people already entered are not comptabilized imediatly
    localFastCache: { [id: string]: string } = {};//id/key is time in ms in string the value is room id
    //ROOM + time Sum the getPeople + Url from the last 40s. Worst case we overSize the room
    private fastCacheEntryTTL = 2 * 60 * 1000;//ms must correspond to the minimum time a user will stay in the room (we do not compute disconnected) - must be greater than the MetaCache TTL
    private metaDataCacheTTL = 60 * 1000;//ms must correspond to loading time of room
    private fastCacheJitter = 5 * 1000;//ms - 5 sec - must correspond to the time for the user to appear in the count API from the moment it load the page

    // @ts-ignore
    constructor(private state, env) {
        this.instances = {}
    }


    async createClone(roomUrl: string): Promise<string> {
        let {origin} = parseUrl(roomUrl);
        const res = await fetch(origin + "/service/loadbalancer/clone?url=" + roomUrl);
        //update instance cache
        const metasForRoom = await this.getMetasForRoom(roomUrl);
        this.instances[metasForRoom.roomSID] = metasForRoom;//cache for next time
        return await res.json();
    }

    async getMetasForRoom(roomUrl: string): Promise<Instances> {
        let {origin, roomSID} = parseUrl(roomUrl);
        //https://alphahub.aptero.co/service/loadbalancer/meta?url=https%3A%2F%2Falphahub.aptero.co%2FzdBzwbV%2Fwowza-live-stream-test
        const res = await fetch(origin + "/service/loadbalancer/meta?url=" + roomUrl);
        return (await res.json()) || {roomSID, clones: {}};
    }

    async getInstance(url: string): Promise<Instances> {
        const {roomSID} = parseUrl(url);
        //use cache
        for (const instancesKey in this.instances) {
            const instance = this.instances[instancesKey];
            //test if the url correspond to one of the clones
            for (const cloneRoomSID in instance.clones) {
                if (cloneRoomSID === roomSID) {
                    //manual cache management
                    //ensure latest data - return entire instance - non blocking
                    if ((this.instances[instancesKey].updateTime + this.metaDataCacheTTL) < (new Date().getTime())) {
                        this.instances[instancesKey].updateTime = new Date().getTime();//increase the update time to avoid spam waiting for the request
                        //non blocking update
                        this.getMetasForRoom(url).then(metasForRoom => {
                            this.cleanUpEntryInPast(this.fastCacheJitter);
                            this.instances[metasForRoom.roomSID] = metasForRoom;
                            this.instances[metasForRoom.roomSID].updateTime = new Date().getTime();
                        });
                    }
                    return this.getInstanceUsingFastCache(instance);
                }
            }
        }
        return this.getInstanceUsingFastCache(await this.updateRoomFromOrigin(url));
    }

    cleanUpEntryInPast(pastDelta: number) {
        let time = new Date().getTime();
        for (const localFastCacheKey in this.localFastCache) {
            if (+localFastCacheKey < (time - pastDelta)) {
                delete this.localFastCache[localFastCacheKey];
            }
        }
    }

    getInstanceUsingFastCache(instance: Instances): Instances {
        let ret: Instances = JSON.parse(JSON.stringify(instance));//deep copy
        this.cleanUpEntryInPast(this.fastCacheEntryTTL);//X ms in the past compared to know
        for (const cloneRoomSID in ret.clones) {
            //remove old entry
            for (const localFastCacheKey in this.localFastCache) {
                const entry = this.localFastCache[localFastCacheKey];
                if (entry === cloneRoomSID) {
                    ret.clones[cloneRoomSID].people++;
                }
            }
        }
        return ret;
    }

    isRoomIDInInstance(instance:Instances,roomID:string){
        return Object.keys(instance.clones).indexOf(roomID)!==-1;//roomID found in clones
    }

    private async updateRoomFromOrigin(url: string): Promise<Instances> {
        const metasForRoom = await this.getMetasForRoom(url);
        this.cleanUpEntryInPast(this.fastCacheJitter);
        this.instances[metasForRoom.roomSID] = metasForRoom;
        this.instances[metasForRoom.roomSID].updateTime = new Date().getTime();
        return this.instances[metasForRoom.roomSID];
    }

    async fetch(request: Request) {
        return this.state.blockConcurrencyWhile(async ()=>{
            let json = await request.json() as any;
            let fct = json.fct;
            const url = new URL(request.url);
            const urlString = url.origin + url.pathname;//remove search params
            switch (fct) {
                case ADD_USER:
                    return new Response(JSON.stringify(await this.notifyCount(urlString)));
                case GET_META:
                    return new Response(JSON.stringify(await this.getInstance(urlString)));
                case CLONE:
                    return new Response(JSON.stringify(await this.createClone(urlString)));
                default:
                    throw new Error();
            }
        });
    }

    private async notifyCount(urlIn: string): Promise<void> {
        let {roomSID} = parseUrl(urlIn);
        this.localFastCache[new Date().getTime()] = roomSID;
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

    public async getResponse() {
        const url = new URL(this.request.url);
        const {pathname, search} = url;
        let host = "https://alphahub.aptero.co"
        // @ts-ignore
        const headers = new Headers(this.request.headers);
        if (headers.get("fetchhost")) {
            host = "https://" + headers.get("fetchhost");
        }
        this.targetUrl = host + pathname + search;

        if (url.href.endsWith(".ico") || url.href.endsWith(".js") || url.href.endsWith(".css") || url.href.endsWith(".gltf")) {
            const res = await fetch(this.targetUrl, {
                body: this.request.body,
                headers: this.request.headers,
                method: this.request.method,
                redirect: "manual",
            });
            return new Response(res.body, {status: res.status, statusText: res.statusText, headers: res.headers});
        }

        switch (url.searchParams.get("debug")) {
            //eg
            //http://127.0.0.1:8787/PaLjUa2/room-balancer-test-2?debug=meta
            //http://room-balancer.aptero.workers.dev/PaLjUa2/room-balancer-test-2?debug=meta
            case "meta":
                return new Response(JSON.stringify(await this.getMetasForRoom(this.targetUrl)));
            case "entry":
                const instances = await this.getMetasForRoom(this.targetUrl);
                return new Response(JSON.stringify(getRoomEntry(instances, this.targetUrl)));
            case "count":
                const instances2 = await this.getMetasForRoom(this.targetUrl);
                return new Response(JSON.stringify(RoomBalancer.getPeopleCount(instances2, this.targetUrl)));
            case "clone":
                return new Response(JSON.stringify(await this.createClone(this.targetUrl)));
            case "enter":
                return new Response(JSON.stringify(await this.computeRoomURL(this.targetUrl)));
        }

        let offline = url.searchParams.get("offline2") === "true"
            || url.searchParams.get("offline") === "true"
            || url.searchParams.get("nolb") === "true";
        const isGet = this.request.method === "GET";
        if (offline || !isGet) {
            //exception to load-balancer
            const response = await this.fetchRoomBody(this.targetUrl);
            response.headers.set("fetchhost", headers.get("fetchhost") || "error");
            return response;
        } else {
            const response = await this.computeRoomBody(this.targetUrl);
            response.headers.set("fetchhost", headers.get("fetchhost") || "error");
            return response;
        }
        //return fetchRoomBody(targetUrl);
    }

    async notifyFastCache(urlIn: string): Promise<void> {
        await this.roomBalancerDO.fetch(urlIn, {
            method: 'POST',
            headers: {
                dataObjectRequest: ADD_USER//to identify request in log
            },
            body: JSON.stringify({
                fct: ADD_USER,
            }),
        });
    }

    async createClone(urlIn: string): Promise<string> {
        return await (await this.roomBalancerDO.fetch(urlIn, {
            method: 'POST',
            headers: {
                dataObjectRequest: CLONE//to identify request in log
            },
            body: JSON.stringify({
                fct: CLONE,
            }),
        })).json();
    }

    async getMetasForRoom(urlIn: string): Promise<Instances> {
        return await (await this.roomBalancerDO.fetch(urlIn, {
            method: 'POST',
            headers: {
                dataObjectRequest: GET_META//to identify request in log
            },
            body: JSON.stringify({
                fct: GET_META,
            }),
        })).json();
    }

    async fetchRoomBody(targetUrl: string) {
        //this request is cached every minutes
        const requestHeaders = new Headers();
        requestHeaders.set("x-room-balancer", "true");
        const res = await fetch(targetUrl, {
            headers: requestHeaders, cf: {
                //https://developers.cloudflare.com/workers//runtime-apis/request#requestinitcfproperties
                cacheEverything: true,
                cacheTtl: 2 * 60 * 60,//// for a max of 60 seconds before revalidating the resource
            }
        });
        const responseHeaders = new Headers(res.headers);
        return new Response(res.body, {status: res.status, statusText: res.statusText, headers: responseHeaders});
    }

    async computeRedirectUrl(metasForRoom: Instances, roomSID: string, maxLoad: number, urlIn: string): Promise<string> {
        //find a suitable clone (aka a clone with a reasonable load)
        for (const key in metasForRoom.clones) {
            const clone = metasForRoom.clones[key];
            let url = urlIn.replace(roomSID, key);//url of the clone with the right origin
            let load = clone.people;
            if (load < maxLoad) {
                //console.log("Assigning to new room : " + load + "/" + maxLoad + " : " + url);
                return url;
            }
        }
        //at this point if no clone found create one
        let room = await this.createClone(urlIn);//new url
        //console.log("Creating a new room : " + room);
        return room;
    }

    async computeRoomURL(urlIn: string): Promise<string> {
        let {roomSID} = parseUrl(urlIn);
        //console.log("computeUrl on : " + roomSID);
        let instances = await this.getMetasForRoom(urlIn);
        if (!instances.roomSID) {
            throw new Error("invalid data from DB");
        }
        //console.log("Request for balancing on : " + urlIn);
        let roomEntry = getRoomEntry(instances, urlIn);
        let maxLoad = roomEntry.peopleMax;
        let load = RoomBalancer.getPeopleCount(instances, urlIn);
        const delta = maxLoad > 8 ? 2 : 0;//margin of empty space
        if (load >= (maxLoad - delta)) {
            //console.log("Try assigning to new room : " + load + "/" + maxLoad);
            let outputUrl = await this.computeRedirectUrl(instances, roomSID, maxLoad, urlIn);
            //add +1user on this url do not wait write
            this.notifyFastCache(outputUrl).then(() => {
            });
            return outputUrl;
        } else {
            //console.log("Accept current room : " + load + "/" + maxLoad + " : " + urlIn);
            //add +1user on this url do not wait write
            this.notifyFastCache(urlIn).then(() => {
            });
            return urlIn;
        }
    }

    async computeRoomBody(urlIn: string): Promise<Response> {
        return this.fetchRoomBody(await this.computeRoomURL(urlIn));
    }

    private static getPeopleCount(instances: Instances, urlIn: string): number {
        return getRoomEntry(instances, urlIn).people;
    }
}

