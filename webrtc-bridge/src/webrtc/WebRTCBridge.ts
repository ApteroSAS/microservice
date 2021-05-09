import {JWTAuth} from "@root/jwt/JWTAuth";
import {properties} from "@root/properties/properties";
import PhoenixController from "@root/phoenix/PhoenixController";
import DialogAdapter from "@root/webrtc/DialogAdapter";
import RTCAudioSourceSineWave from './RTCAudioSourceSineWave';
import RTCCompoundAudioSource from "@root/webrtc/RTCCompoundAudioSource";

export default class WebRTCBridge {
    jwtAuth = new JWTAuth(properties.JWT_SECRET);
    phoenixController = new PhoenixController(this.jwtAuth, properties.ADMIN_USER, "6f016efef5a501bd");
    botList = {};

    async createBridge(roomA,roomB){
        let handleRoomA = await this.connect(roomA);
        let handleRoomB = await this.connect(roomB);
        this.createBridgeFromTo(handleRoomA,handleRoomB);
        this.createBridgeFromTo(handleRoomB,handleRoomA);
    }

    async createBridgeFromTo(from,to){
        let source = new RTCCompoundAudioSource();
        from.setOnOccupantConnected(async (peer)=>{
            console.log("new peer : "+peer,from)
            let mediaStream = await from.getMediaStream(peer)
            let tracks = mediaStream.getAudioTracks();
            source.addTrack(peer,tracks[0]);
        });
        //Take a liste of ocuppant trac and send it to the others
        const sinsource = new RTCAudioSourceSineWave();
        //source.addTrack("sin",sinsource.createTrack());
        const track = source.createTrack();
        to.setLocalMediaStream(track);//TODO in hubs add the fact that the sin sound works everytimes
    }

    getBotList(){
        return Object.keys(this.botList);
    }

    async connect(roomID){
        let {hubPhxChannel,data} = await this.phoenixController.connectToRoom(roomID);
        const entryEvent = {
            ... { isNewDaily: true, isNewMonthly: true, isNewDayWindow: true, isNewMonthWindow: true },
            initialOccupantCount:0,
            entryDisplayType:"Screen",
            userAgent: "nodejs"
        };
        this.botList[data.session_id]=true;
        await hubPhxChannel.push("message", {type:"distributed-system-bot-creation",body:data.session_id});
        //await hubPhxChannel.push("events:entering", {});
        //await hubPhxChannel.push("events:entered", entryEvent);
        console.log("connect client : "+roomID, data.session_id, data.perms_token);
        let dialog = new DialogAdapter();
        dialog.setParams("wss://dedicatedwebrtc4.aptero.co", roomID, data.session_id, data.perms_token, {
            "host": "dedicatedwebrtc4.aptero.co",
            "port": "443",
            "turn": {
                "credential": "fX/ZiIyVCCDqkgf3MAqxL8xSD1E=",
                "enabled": true,
                "transports": [
                    {
                        "port": 5349
                    }
                ],
                "username": "1619346637:coturn"
            }
        });
        await dialog.connect();
        return dialog;
    }

}