import PostgrestController from "@root/postgrest/PostgrestController";

export interface PgIdentityModel {
    identity_id?: string,//auto
    name?: string,
    account_id?: string,
    inserted_at?: string,//auto
    updated_at?: string,//auto
}

export class PgIdentities {
    constructor(private postgrestController: PostgrestController) {

    }

    async find(account_id:string):Promise<PgIdentityModel[]> {
        return this.postgrestController.find<PgIdentityModel>("identities", "select=*" +
            ",identity_id::text" +
            ",name::text" +
            ",account_id::text" +
            "&account_id=eq." + account_id);
    }

    async findByIdentity(value:string):Promise<PgIdentityModel[]> {
        return await this.postgrestController.find<PgIdentityModel>("identities", "select=*" +
            ",identity_id::text" +
            ",name::text" +
            ",account_id::text" +
            "&name=eq." + value);
    }

}
