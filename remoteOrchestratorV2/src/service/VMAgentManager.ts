import axios from "axios";

interface Agent {
    url: string,
}

export interface ImgParams{
    EPHEMERAL?:"true"|"false",
    URL:string,
    KIOSK_BTN:"true"|"false",
    MODE:"kiosk"|"app",
    EXTENSION_LIST:string,//"[]"
    LANG:string,//"en_GB.UTF-8"
    LANGUAGE:string,//"en_GB.UTF-8"
}

export interface CreateData {
    remoteScreenSessionId: string,
    screenSizeX: number,
    screenSizeY: number,
    dockerImage: string,
    imageParams: ImgParams
}

export class VMAgentManager {
    public readonly prefix = "web-renderer-";
    vmAgentList: Record<string, Agent> = {
        pixis: {url: "vm1.aptero.co/service/remote/orchestrator"},
        //armin:{url:"vm2.aptero.co/service/remote/orchestrator"},
        //eren:{url:"vm3.aptero.co/service/remote/orchestrator"},
        //saturn:{url:"vm4.aptero.co/service/remote/orchestrator"},
    }
    default: Agent = this.vmAgentList["pixis"];
    sidAgentCache: Record<string, { container: string, agent: Agent }> = {};

    async createOrRetrieveScreen(sessionID: string, screenSizeX: number, screenSizeY: number, dockerImage: string, imageParams: ImgParams):Promise<{
        url:string,
        ip:string,
        port:string,
        vmsid:string
    }> {
        let vmAgent = this.default;
        let data:CreateData = {
            remoteScreenSessionId: sessionID,
            screenSizeX, screenSizeY, dockerImage, imageParams
        };
        return (await axios.post("https://"+vmAgent.url + "/create", data)).data as any;
    }


    private async listAgentContainerWithCache(): Promise<Record<string, { container: string, agent: Agent }>> {
        for (const vmAgentListKey in this.vmAgentList) {
            const agent = this.vmAgentList[vmAgentListKey];
            const resp = await axios.get(agent.url + "/vm/list");
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
        return (await axios.get("https://"+vmAgent.agent.url + "/heart/beat/" + sid)).data as any;
    }

    async pauseOrCleanUp(sid: string): Promise<void> {
        let vmAgent = await this.sidToVMAgent(sid);
        return (await axios.get("https://"+vmAgent.agent.url + "/vm/pause/" + sid)).data as any;
    }

    async resume(sid: string): Promise<any> {
        let vmAgent = await this.sidToVMAgent(sid);
        return (await axios.get("https://"+vmAgent.agent.url + "/vm/resume/" + sid)).data as any;
    }

    async remove(sid: string): Promise<any> {
        let vmAgent = await this.sidToVMAgent(sid);
        return (await axios.get("https://"+vmAgent.agent.url + "/vm/remove/" + sid)).data as any;
    }

    async listContainer(): Promise<Record<string, { container: string, agent: Agent }>> {
        return await this.listAgentContainerWithCache();
    }

}
