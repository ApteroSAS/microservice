import {JWTAuth} from "@root/jwt/JWTAuth";
import {properties} from "@root/properties/properties";
import PhoenixController from "@root/phoenix/PhoenixController";
import DialogAdapter from "@root/webrtc/DialogAdapter";
import RTCAudioSourceSineWave from './rtcaudiosourcesinewave';

export default class WebRTCBridge {
    jwtAuth = new JWTAuth(properties.JWT_SECRET);
    phoenixController = new PhoenixController(this.jwtAuth, properties.ADMIN_USER, "6f016efef5a501bd");

    async createBridge(roomA,roomB){
        let handleRoomA = await this.connect(roomA);
        const source = new RTCAudioSourceSineWave();
        const track = source.createTrack();
        handleRoomA.setLocalMediaStream(track);
        //let handleRoomB = await this.connect(roomB);
        //this.createBridgeFromTo(handleRoomA,handleRoomB);
        //this.createBridgeFromTo(handleRoomB,handleRoomA);
    }

    async createBridgeFromTo(from,to){
        const audioTransceiverFrom = from._recvTransport._handler._pc.addTransceiver('audio');
        //const videoTransceiverFrom = from.peerConnection.addTransceiver('video');
        const audioTransceiverTo = to._sendTransport._handler._pc.addTransceiver('audio');
        //const videoTransceiverTo = to.peerConnection.addTransceiver('video');
        await Promise.all([
            audioTransceiverTo.sender.replaceTrack(audioTransceiverFrom.receiver.track),
            //videoTransceiverTo.sender.replaceTrack(videoTransceiverFrom.receiver.track)
        ]);
        //from.setLocalMediaStream(audioTransceiverFrom.receiver);
        to.setLocalMediaStream(audioTransceiverTo.sender);
    }

    async connect(roomID){
        let {hubPhxChannel,data} = await this.phoenixController.connectToRoom(roomID);
        const entryEvent = {
            ... { isNewDaily: true, isNewMonthly: true, isNewDayWindow: true, isNewMonthWindow: true },
            initialOccupantCount:0,
            entryDisplayType:"Screen",
            userAgent: "nodejs"
        };
        await hubPhxChannel.push("message", {type:"distributed-system-bot-creation",body:data.session_id});
        await hubPhxChannel.push("events:entering", {});
        await hubPhxChannel.push("events:entered", entryEvent);
        console.log("connect client : "+roomID, data.session_id, data.perms_token)
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