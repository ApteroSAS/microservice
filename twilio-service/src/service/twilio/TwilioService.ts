import {properties} from "@root/properties/properties"
import * as Twilio from 'twilio';
//const AccessToken = require('twilio').jwt.AccessToken;
//const VideoGrant = AccessToken.VideoGrant;

const MAX_ALLOWED_SESSION_DURATION = 86400;
const twilioAccountSid = properties.TWILIO_ACCOUNT_SID;
const twilioAuthToken  = properties.TWILIO_AUTH_TOKEN;
const twilioApiKeySID = properties.TWILIO_API_KEY_SID;
const twilioApiKeySecret = properties.TWILIO_API_KEY_SECRET;

export default class TwilioService {

    async getToken(identity:string, roomName:string):Promise<string>{
        //https://www.twilio.com/docs/video/tutorials/user-identity-access-tokens
        const token = new Twilio.jwt.AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
            ttl:MAX_ALLOWED_SESSION_DURATION,
            identity: identity,
        });
        const videoGrant = new Twilio.jwt.AccessToken.VideoGrant({ room: roomName });
        token.addGrant(videoGrant);
        console.log(`issued token for ${identity} in room ${roomName}`);
        return token.toJwt()
    }

    async getIce():Promise<{
        "accountSid": string,
        "dateCreated": string,
        "dateUpdated": string,
        "iceServers": {
                "url"?: string,
                "username"?: string,
                "urls": string,
                "credential": string
            }[]
        ,
        "password": string,
        "ttl": string,
        "username": string
    }>{
        //https://www.twilio.com/docs/stun-turn
        const client = require('twilio')(twilioAccountSid, twilioAuthToken);
        return await client.tokens.create()
    }

}
