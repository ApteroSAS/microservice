import PostgrestController from "@root/postgrest/PostgrestController";

export class PgRoleMenmbership {
    constructor(private postgrestController: PostgrestController) {

    }

    async updateRoom(hub_id:string,account_id:string,enabled:boolean) {
        if(enabled) {
            return this.postgrestController.insert("hub_role_memberships", {
                "hub_id": hub_id,
                "account_id": account_id,
                "inserted_at":new Date().toISOString(),
                "updated_at":new Date().toISOString(),
            });
        }else{
            throw new Error("not implemented yet");
        }
    }

}
