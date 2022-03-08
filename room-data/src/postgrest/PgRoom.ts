import PostgrestController from "@root/postgrest/PostgrestController";

export interface PgRoomModel {
    hub_id?: string,
    hub_sid?: string,
    slug?: string,
    name?: string,
    default_environment_gltf_bundle_url?: string,
    inserted_at?: string,
    updated_at?: string,
    max_occupant_count?: string,
    entry_mode?: string,
    spawned_object_types?: string,
    scene_id?: string,
    entry_code?: string,
    entry_code_expires_at?: string,
    host?: string,
    created_by_account_id?: string,
    scene_listing_id?: string,
    creator_assignment_token?: string,
    last_active_at?: string,
    embed_token?: string,
    embedded?: boolean,
    member_permissions?: string,
    allow_promotion?: string,
    description?: string,
    room_size?: string,
    user_data?: string,
}

export class PgRoom {
    constructor(private postgrestController: PostgrestController) {

    }

    async setEntryMode(hubSID, entryMode) {
        await this.updateRoom(hubSID,{"entry_mode": entryMode});
    }

    async updateRoom(hubSID: string, data: PgRoomModel) {
        const hub_id = await this.getDBId(hubSID);
        await this.postgrestController.update("hubs", "hub_id=eq." + hub_id, data)
        return {
            hubSID,
            data
        }
    }

    async getRoomDataFromSID(hubSID: string): Promise<PgRoomModel> {
        let hubList = await this.postgrestController.find("hubs", "select=*,hub_id::text&hub_sid=eq." + hubSID);
        if (hubList.length != 1) {
            throw new Error();
        } else {
            return hubList[0];
        }
    }

    async getDBId(hubSID: string): Promise<string> {
        let hub = await this.getRoomDataFromSID(hubSID);
        return hub.hub_id;
    }

    async getEmbedToken(roomSID: string) {
        const hub = await this.getRoomDataFromSID(roomSID);
        await this.updateRoom(roomSID,{embedded:true});
        return hub.embed_token;
    }
}
