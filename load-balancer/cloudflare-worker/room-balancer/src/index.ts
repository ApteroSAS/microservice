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
import {PromiseQueue} from "./PromiseQueue";

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

interface CloneInstance {
    url: string,
    name: string,
    people: number,
    peopleMax: number,
    main?: boolean,
    current: boolean,
    updateTime: number,
    parentRoomSID: string,
    brothers:string[]
}

function makeid(length: number) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
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

function getPeopleCount(instances: Instances, urlIn: string): number {
    return getRoomEntry(instances, urlIn).people;
}

const COMPUTE_URL = "COMPUTE_URL";

export class RoomBalancerDurableObject {
    private metaDataCacheTTL = 1 * 60 * 1000;//ms must correspond to the minimum time a user will stay in the room (we do not compute disconnected)

    // @ts-ignore
    constructor(private state, env) {
        //this.state.storage.set(new Date().getTime() + 24*60*60*1000) //cleanup in 24 hour
    }

    /*alarm(){
        this.state.storage.deleteAll();
    }*/

    async createClone(roomUrl: string, txn: DurableObjectTransaction): Promise<string> {
        let {origin} = parseUrl(roomUrl);
        const res = await fetch(origin + "/service/loadbalancer/clone?url=" + roomUrl);
        //update instance cache
        const newurl = await res.json() as string;
        await this.updateRoomFromOrigin(roomUrl,txn);
        return newurl;
    }

    async getMetasForRoom(roomUrl: string): Promise<Instances> {
        let {origin, roomSID} = parseUrl(roomUrl);
        //https://alphahub.aptero.co/service/loadbalancer/meta?url=https%3A%2F%2Falphahub.aptero.co%2FzdBzwbV%2Fwowza-live-stream-test
        const res = await fetch(origin + "/service/loadbalancer/meta?url=" + roomUrl);
        return (await res.json()) || {roomSID, clones: {}};
    }

    async getEntry(url: string, txn: DurableObjectTransaction): Promise<CloneInstance> {
        const {roomSID} = parseUrl(url);
        //use cache
        const instance = await txn.get(roomSID, {noCache: false}) as CloneInstance;
        //manual cache management
        //ensure latest data - return entire instance - non blocking
        if(instance){
            if ((instance.updateTime + this.metaDataCacheTTL) < (new Date().getTime())) {
                return await this.updateRoomFromOrigin(url, txn);
            } else {
                return instance;
            }
        }else {
            //cache miss fetch the data
            return await this.updateRoomFromOrigin(url, txn);
        }
    }

    isRoomIDInInstance(instance: Instances, roomID: string) {
        return Object.keys(instance.clones).indexOf(roomID) !== -1;//roomID found in clones
    }

    private async updateRoomFromOrigin(url: string, txn: DurableObjectTransaction): Promise<CloneInstance> {
        const {roomSID} = parseUrl(url);
        const metasForRoom:Instances = await this.getMetasForRoom(url);
        let putAll:{[id:string]:CloneInstance} = {};
        for (const metasForRoomKey in metasForRoom.clones) {
            const clone = metasForRoom.clones[metasForRoomKey];
            (clone as any).updateTime = new Date().getTime();
            (clone as any).parentRoomSID = metasForRoom.roomSID;
            (clone as any).brothers = Object.keys(metasForRoom.clones);
            putAll[metasForRoomKey] = clone as CloneInstance;
        }
        await txn.put(putAll, {noCache: false});
        return putAll[roomSID];
    }

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
            case "list":
                return new Response(JSON.stringify(Object.fromEntries(await this.state.storage.list())));
            case "enter":
            case COMPUTE_URL:
                return new Response(JSON.stringify(await this.computeRoomURL(urlString)));
            default:
                throw new Error();
        }
    }

    async computeRedirectUrl(clonesKeys:string[], maxLoad: number, urlIn: string,txn:DurableObjectTransaction): Promise<(string | null)> {
        //find a suitable clone (aka a clone with a reasonable load)
        for (const cloneRoomSID of clonesKeys) {
            const clone = await txn.get(cloneRoomSID) as CloneInstance;
            if(!clone){
                throw new Error("key not found :"+cloneRoomSID)
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
            const roomEntry = await this.getEntry(urlIn,txn);
            const maxLoad = roomEntry ? roomEntry.peopleMax : 15;
            const load = roomEntry ? roomEntry.people : 0;
            const delta = maxLoad >= 8 ? 2 : 0;//margin of empty space
            let clonesKeys = roomEntry.brothers;
            if (load >= (maxLoad - delta)) {
                //console.log("Try assigning to new room : " + load + "/" + maxLoad);
                let outputUrl = await this.computeRedirectUrl(clonesKeys,maxLoad, urlIn,txn);
                if (outputUrl == null) {
                    //at this point if no clone found create one
                    //console.log("Creating a new room : " + room);
                    outputUrl = await this.createClone(urlIn, txn);
                }
                //add +1user on this url do not wait write
                this.notifyCount(outputUrl, txn).then(()=>{});
                return outputUrl;
            } else {
                //console.log("Accept current room : " + load + "/" + maxLoad + " : " + urlIn);
                //add +1user on this url do not wait write
                this.notifyCount(urlIn, txn).then(()=>{});
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

    public async getResponse() {
        const url = new URL(this.request.url);
        const {pathname, search} = url;
        let host = "https://alphahub.aptero.co"
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

        if (url.searchParams.get("debug")) {
            //eg
            //http://127.0.0.1:8787/PaLjUa2/room-balancer-test-2?debug=meta
            //http://room-balancer.aptero.workers.dev/PaLjUa2/room-balancer-test-2?debug=meta
            return new Response(JSON.stringify(await this.execDurableObject(this.targetUrl,url.searchParams.get("debug") as string)));
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

    async execDurableObject<T>(urlIn: string, fct: string): Promise<T> {
        return await (await this.roomBalancerDO.fetch(urlIn, {
            method: 'POST',
            headers: {
                dataObjectRequest: fct//to identify request in log
            },
            body: JSON.stringify({
                fct: fct,
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
                cacheTtl: 24 * 60 * 60,//// for a max of X seconds before revalidating the resource
            }
        });
        const responseHeaders = new Headers(res.headers);
        return new Response(res.body, {status: res.status, statusText: res.statusText, headers: responseHeaders});
    }

    async computeRoomBody(urlIn: string): Promise<Response> {
        return this.fetchRoomBody(await this.execDurableObject<string>(urlIn,COMPUTE_URL));
    }
}
