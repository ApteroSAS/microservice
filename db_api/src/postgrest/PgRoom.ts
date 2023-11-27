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

    async copyParams(srcSID:string,dstSID:string):Promise<{data:PgRoomModel,hubSID:string}>{
        let pgRoomModelSrc = await this.getRoomDataFromSID(srcSID);
        let pgRoomModelDst = await this.getRoomDataFromSID(dstSID);
        //update the room
        pgRoomModelDst.name = pgRoomModelSrc.name;
        pgRoomModelDst.default_environment_gltf_bundle_url = pgRoomModelSrc.default_environment_gltf_bundle_url;
        pgRoomModelDst.entry_mode = pgRoomModelSrc.entry_mode;
        pgRoomModelDst.spawned_object_types = pgRoomModelSrc.spawned_object_types;
        pgRoomModelDst.scene_id = pgRoomModelSrc.scene_id;
        //pgRoomModelDst.entry_code = pgRoomModelSrc.entry_code;//duplicate key value violates unique constraint "hubs_entry_code_index"
        //pgRoomModelDst.entry_code_expires_at = pgRoomModelSrc.entry_code_expires_at;//duplicate key value violates unique constraint "hubs_entry_code_index"
        pgRoomModelDst.host = pgRoomModelSrc.host;
        pgRoomModelDst.created_by_account_id = pgRoomModelSrc.created_by_account_id;
        pgRoomModelDst.scene_listing_id = pgRoomModelSrc.scene_listing_id;
        pgRoomModelDst.creator_assignment_token = pgRoomModelSrc.creator_assignment_token;
        pgRoomModelDst.embed_token = pgRoomModelSrc.embed_token;
        pgRoomModelDst.embedded = pgRoomModelSrc.embedded;
        pgRoomModelDst.member_permissions = pgRoomModelSrc.member_permissions;
        pgRoomModelDst.allow_promotion = pgRoomModelSrc.allow_promotion;
        pgRoomModelDst.description = pgRoomModelSrc.description;
        pgRoomModelDst.room_size = pgRoomModelSrc.room_size;
        pgRoomModelDst.user_data = pgRoomModelSrc.user_data;
        return await this.updateRoom(dstSID,pgRoomModelDst);
    }

    async updateRoom(hubSID: string, data: PgRoomModel) :Promise<{data:PgRoomModel,hubSID:string}>{
        const hub_id = await this.getDBId(hubSID);
        await this.postgrestController.update("hubs", "hub_id=eq." + hub_id, data)
        return {
            hubSID,
            data
        }
    }

    async getRoomDataFromSID(hubSID: string): Promise<PgRoomModel> {
        let hubList = await this.postgrestController.find("hubs", "select=*" +
            ",hub_id::text" +
            ",created_by_account_id::text" +
            ",scene_id::text" +
            ",spawned_object_types::text" +
            ",scene_listing_id::text" +
            "&hub_sid=eq." + hubSID);
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
