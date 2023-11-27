import {PgHubRoleMemberships} from "@root/postgrest/PgHubRoleMemberships";

export class RoomUserBDAccess {
    constructor(private pgHubRoleMemberships: PgHubRoleMemberships) {

    }

    async setModeratorMultiple(emails: string[], roomSIDs: string[]):Promise<void> {
        for (let email of emails) {
            for (let roomSID of roomSIDs) {
                await this.setModerator(email, roomSID);
            }
        }
    }

    async setModerator(email: string, roomSID: string):Promise<void> {
        //account_id retreived from mongodb using mail (fix reticulum to notify account id right) in userId? or can use identity
        //hub_id retreived from pgadmin Room DB roomSID
        //update to PgRoleMemberships

        //TODO
    }
}
