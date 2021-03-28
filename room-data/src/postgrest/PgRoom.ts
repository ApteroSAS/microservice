import PostgrestController from "@root/postgrest/PostgrestController";

export class PgRoom {
    constructor(private postgrestController: PostgrestController) {

    }

    async setEntryMode(hubSID, entryMode) {
        let hubList = await this.postgrestController.find("hubs", "select=*,hub_id::text&hub_sid=eq." + hubSID);
        if (hubList.length != 1) {
            console.error(hubList);
        }else {
            let hub = hubList[0];
            await this.postgrestController.update("hubs", "hub_id=eq." + hub.hub_id, {"entry_mode": entryMode})
        }
    }
}