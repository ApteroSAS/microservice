import PostgrestController from "@root/postgrest/PostgrestController";

export class PgRoom {
    constructor(private postgrestController: PostgrestController) {

    }

    async setEntryMode(hubSID, entryMode) {
        await this.updateRoom(hubSID,{"entry_mode": entryMode});
    }

    async updateRoom(hubSID: string ,data:any) {
        const hub_id = await this.getDBId(hubSID);
        await this.postgrestController.update("hubs", "hub_id=eq." + hub_id, data)
        return {
            hubSID,
            data
        }
    }

    async getDBId(hubSID: string):Promise<string> {
        let hubList = await this.postgrestController.find("hubs", "select=*,hub_id::text&hub_sid=eq." + hubSID);
        if (hubList.length != 1) {
            throw new Error();
        }else {
            let hub = hubList[0];
            return hub.hub_id;
        }
    }
}
