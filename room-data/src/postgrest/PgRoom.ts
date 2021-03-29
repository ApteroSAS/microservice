import PostgrestController from "@root/postgrest/PostgrestController";

export class PgRoom {
    constructor(private postgrestController: PostgrestController) {

    }

    async setEntryMode(hubSID, entryMode) {
        await this.updateRoom(hubSID,{"entry_mode": entryMode});
    }

    async updateRoom(hubSID: string ,data:any) {
        let hubList = await this.postgrestController.find("hubs", "select=*,hub_id::text&hub_sid=eq." + hubSID);
        if (hubList.length != 1) {
            console.error(hubList);
        }else {
            let hub = hubList[0];
            await this.postgrestController.update("hubs", "hub_id=eq." + hub.hub_id, data)
            return {
                hubSID,
                data
            }
        }
    }
}