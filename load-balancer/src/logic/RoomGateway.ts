export class RoomGateway {
    constructor(serviceUrl: string) {
    }

    async getUserNumber(roomSID: string): Promise<number> {
        return 0;
    }

    async clone(roomSID: string): Promise<{
        "creator_assignment_token": string,
        "embed_token": string,
        "hub_id": string,
        "status": string,
        "url": string
    }> {
        return null;

    }
}