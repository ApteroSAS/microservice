import axios from "axios";
import {properties} from "@root/properties/properties";
import * as https from "https";

interface Agent {
    url: string,
}

export interface ImgParams{
    EPHEMERAL?:"true"|"false"|boolean,
    URL?:string,
    KIOSK_BTN?:"true"|"false",
    MODE?:"kiosk"|"app",
    EXTENSION_LIST?:string,//"[]"
    LANG?:string,//"en_GB.UTF-8"
    LANGUAGE?:string,//"en_GB.UTF-8"
}

export interface CreateData {
    agentServerUrl: string;
    remoteScreenSessionId: string,
    screenSizeX: number,
    screenSizeY: number,
    dockerImage: string,
    imageParams: ImgParams
}

export function makeid(length:number)
{
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
})

export class VMAgentManager {
    public readonly prefix = "web-renderer-";
    public readonly ephemeralPrefix = "ephemeral-";
    vmAgentList: Record<string, Agent> = {
        pixis: {url: "vm1.aptero.co/service/remote/orchestrator"},
        //armin:{url:"vm2.aptero.co/service/remote/orchestrator"},
        //eren:{url:"vm3.aptero.co/service/remote/orchestrator"},
        //saturn:{url:"vm4.aptero.co/service/remote/orchestrator"},
    }
    default: Agent = this.vmAgentList["pixis"];
    sidAgentCache: Record<string, { container: string, agent: Agent }> = {};
    scheme = "https://"
    async createOrRetrieveScreen(
        sessionID: string|undefined,
        screenSizeX: number,
        screenSizeY: number,
        dockerImage: string,
        imageParams: ImgParams,
        agentServerUrl:string
    ):Promise<{
        url:string,
        ip:string,
        port:string,
        vmsid:string
    }> {
        if(!sessionID){
            sessionID = this.ephemeralPrefix+makeid(12);
        }
        if(!dockerImage){
            dockerImage = properties.DEFAULT_IMG;
        }
        if(dockerImage.startsWith("registry.aptero.co/chrome-renderer") ) {
            //Set default for web renderer
            if (!imageParams) {
                imageParams = {};
            }
            //default to EPHEMERAL = true
            if (imageParams.EPHEMERAL !== false && imageParams.EPHEMERAL !== "false") {
                imageParams.EPHEMERAL = true;
            }
            if (!imageParams.MODE) {
                imageParams.MODE = "kiosk";
            }
            if (!imageParams.URL) {
                imageParams.URL = "https://google.com";
            }
            //default lang to english
            if (!imageParams.LANG) {
                imageParams.LANG = "en_GB.UTF-8";
            }
            if (!imageParams.LANGUAGE) {
                imageParams.LANGUAGE = imageParams.LANG;
            }
        }
        let url
        if(agentServerUrl){
            url = agentServerUrl
        }else{
            url = this.default.url
        }
        let data:CreateData = {
            remoteScreenSessionId: sessionID,
            screenSizeX : screenSizeX || 1024,
            screenSizeY: screenSizeY || 768,
            dockerImage,
            imageParams,
            agentServerUrl
        };
        return (await axios.post(this.scheme+url + "/create", data,{httpsAgent})).data as any;
    }


    private async listAgentContainerWithCache(): Promise<Record<string, { container: string, agent: Agent }>> {
        for (const vmAgentListKey in this.vmAgentList) {
            const agent = this.vmAgentList[vmAgentListKey];
            const resp = await axios.get(this.scheme+agent.url + "/vm/list",{httpsAgent});
            if (resp.status !== 200) {
                continue;
            }
            const data: string[] = resp.data as any;
            for (const datum of data) {
                const sessionId = datum.replace(this.prefix, "");
                this.sidAgentCache[sessionId] = {
                    container: datum,
                    agent: agent
                }
            }
        }
        return this.sidAgentCache;
    }

    private async sidToVMAgent(sid: string): Promise<{ container: string, agent: Agent }> {
        if (!this.sidAgentCache[sid]) {
            //update cache
            await this.listAgentContainerWithCache();
        }
        return this.sidAgentCache[sid];
    }

    async hearBeat(sid: string): Promise<any> {
        let vmAgent = await this.sidToVMAgent(sid);
        return (await axios.get(this.scheme+vmAgent.agent.url + "/heart/beat/" + sid,{httpsAgent})).data as any;
    }

    async pauseOrCleanUp(sid: string): Promise<void> {
        let vmAgent = await this.sidToVMAgent(sid);
        return (await axios.get(this.scheme+vmAgent.agent.url + "/vm/pause/" + sid,{httpsAgent})).data as any;
    }

    async resume(sid: string): Promise<any> {
        let vmAgent = await this.sidToVMAgent(sid);
        return (await axios.get(this.scheme+vmAgent.agent.url + "/vm/resume/" + sid,{httpsAgent})).data as any;
    }

    async remove(sid: string): Promise<any> {
        let vmAgent = await this.sidToVMAgent(sid);
        return (await axios.get(this.scheme+vmAgent.agent.url + "/vm/remove/" + sid,{httpsAgent})).data as any;
    }

    async listContainer(): Promise<Record<string, { container: string, agent: Agent }>> {
        return await this.listAgentContainerWithCache();
    }

}
