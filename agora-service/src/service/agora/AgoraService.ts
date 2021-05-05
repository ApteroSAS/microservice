import { properties } from "@root/properties/properties"
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')

export default class AgoraService {
//https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/nodejs
    async getToken(identity:string, roomName:string):Promise<string>{
        // Rtc Examples
        const appID = properties.AGORA_APPID;
        const appCertificate = properties.AGORA_APPCERT;
        const role = RtcRole.PUBLISHER;

        const expirationTimeInSeconds = 3600*4;

        const currentTimestamp = Math.floor(Date.now() / 1000);

        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

        // Build token with uid
        const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, roomName, identity, role, privilegeExpiredTs);

        return tokenA;
    }

}