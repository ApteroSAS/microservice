import { properties } from "@root/properties/properties"
import * as Video from 'twilio-video';
import * as Twilio from 'twilio';
//const AccessToken = require('twilio').jwt.AccessToken;
//const VideoGrant = AccessToken.VideoGrant;

const MAX_ALLOWED_SESSION_DURATION = 14400;
const twilioAccountSid = properties.TWILIO_ACCOUNT_SID;
const twilioApiKeySID = properties.TWILIO_API_KEY_SID;
const twilioApiKeySecret = properties.TWILIO_API_KEY_SECRET;

export default class TwilioService {

    async getToken(identity:string, roomName:string):Promise<string>{
        const token = new Twilio.jwt.AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
            ttl: MAX_ALLOWED_SESSION_DURATION,
        });
        token.identity = identity;
        const videoGrant = new Twilio.jwt.AccessToken.VideoGrant({ room: roomName });
        token.addGrant(videoGrant);
        console.log(`issued token for ${identity} in room ${roomName}`);
        return token.toJwt()
    }

}