import protooClient from "protoo-client";

export default class ProtoSignaling {
    public _protoo: protooClient.Peer;

    emitRTCEvent(level, tag, msgFunc) {
        const time = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
        });
        console.log("rtc_event", { level, tag, time, msg: msgFunc() });
    }

    async connect(serverUrl:string,roomId:string,clientId:string,joinRoom:any){
        const urlWithParams = new URL(serverUrl);
        urlWithParams.searchParams.append("roomId", roomId);
        urlWithParams.searchParams.append("peerId", clientId);

        const protooTransport = new protooClient.WebSocketTransport(urlWithParams.toString());
        this._protoo = new protooClient.Peer(protooTransport);
        this._protoo.on("disconnected", () => {
            this.emitRTCEvent("info", "Signaling", () => `Disconnected`);
        });

        this._protoo.on("failed", attempt => {
            this.emitRTCEvent("error", "Signaling", () => `Failed: ${attempt}, retrying...`);
        });

        this._protoo.on("close", () => {
            this.emitRTCEvent("error", "Signaling", () => `Closed`);
        });

        await new Promise((resolve, reject) => {
            this._protoo.on("open", async () => {
                this.emitRTCEvent("info", "Signaling", () => `Open`);
                try {
                    await joinRoom();
                    resolve(true);
                } catch (err) {
                    this.emitRTCEvent("warn", "Adapter", () => `Error during connect: ${err}`);
                    reject(err);
                }
            });
        });

    }

}