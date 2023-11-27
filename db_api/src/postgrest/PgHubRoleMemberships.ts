import PostgrestController from "@root/postgrest/PostgrestController";

export interface PgHubRoleMembershipsModel {
    hub_role_membership_id?: string,//auto
    hub_id?: string,
    account_id?: string,
    inserted_at?: string,//auto
    updated_at?: string,//auto
}

export class PgHubRoleMemberships {
    constructor(private postgrestController: PostgrestController) {

    }

    async insertHubRoleMemberships(room_id:string, account_id:string) {
        let data: PgHubRoleMembershipsModel = {
            hub_id: room_id,
            account_id: account_id,
        };
        return await this.postgrestController.insert("hubs_role_memberships", data);
    }
}
