import PostgrestController from "@root/postgrest/PostgrestController";

export interface PgHubRoleMembershipsModel {
    hub_role_membership_id?: string,//auto
    hub_id?: string,
    account_id?: string,
    inserted_at?: string,//auto
    updated_at?: string,//auto
}

export class PgRoleMembership {
    constructor(private postgrestController: PostgrestController) {

    }

    async insert(hub_id:string, account_id:string):Promise<void> {
        return this.postgrestController.insert("hub_role_memberships", {
            "hub_id": hub_id,
            "account_id": account_id,
            "inserted_at":new Date().toISOString(),
            "updated_at":new Date().toISOString(),
        } as PgHubRoleMembershipsModel);
    }

    async find(hub_id:string, account_id:string):Promise<PgHubRoleMembershipsModel[]> {
        return this.postgrestController.find<PgHubRoleMembershipsModel>("hub_role_memberships", "select=*" +
            ",hub_id::text" +
            ",account_id::text" +
            "&hub_id=eq." + hub_id +
            "&account_id=eq." + account_id);
    }

}
