import {PgIdentities} from "@root/postgrest/PgIdentities";
import {PgRoom} from "@root/postgrest/PgRoom";
import {PgRoleMembership} from "@root/postgrest/PgRoleMembership";

export class RoomUserBDAccess {
    constructor(
        private pgRoleMembership: PgRoleMembership,
        private pgIdentities: PgIdentities,
        private pgRoom: PgRoom,
        ) {

    }

    async setModeratorMultiple(emails: string[], roomSIDs: string[]):Promise<void> {
        for (let email of emails) {
            for (let roomSID of roomSIDs) {
                await this.setModerator(email, roomSID);
            }
        }
    }

    async setModerator(email: string, roomSID: string):Promise<void> {
        //account_id retreived from PGAdmin identity table
        //hub_id retreived from pgadmin Room DB roomSID
        //update to PgRoleMemberships
        //TODO

        let identities = await this.pgIdentities.findByIdentity(email);
        if(identities.length == 0){
            throw new Error("identity not found : "+email);
        }
        let identity = identities[0];
        const account_id = identity.account_id;
        if(!account_id){
            throw new Error("account_id not found : "+email);
        }

        let pgRoomModel = await this.pgRoom.getRoomDataFromSID(roomSID);
        const hub_id = pgRoomModel.hub_id;
        if(!hub_id){
            throw new Error("room not found : "+roomSID);
        }


        if((await this.pgRoleMembership.find(hub_id, account_id)).length === 0){
            await this.pgRoleMembership.insert(hub_id, account_id);
        }
        //otherwise do nothing since the user is already moderator
    }
}
