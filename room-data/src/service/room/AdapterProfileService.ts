export default class AdapterProfileService {

    getTurnAuthToken() {
        return {
            SID: "AC2b4884e41acc8b8ed9f7ee795969d76b",
            auth: "U0tjYzMxZDM0N2YxOGVlYmM3MjNiMDgzNTc0ZTE2MWJjMDp6bFM1TjNmbGhWMEdOc0ZLcG1vbFBucW1TcWdMbEliNQ=="
        }
    }

    getProfiles() {
        let profiles = {};
        //generic
        profiles["dialog-io"] = {
            adapter: "dialog-io",
            transport: "WebSocketIOTransport",
        };
        profiles["dialog"] = {
            adapter: "dialog"
        };
        profiles["none"] = {};
        profiles["janus"] = {
            adapter: "janus"
        };
        //meet
        profiles["twilio"] = {
            adapter: "twilio",
            transport: "WebSocketIOTransport",
            url: "https://meet.aptero.co/service/twilio/token"
        };
        profiles["agora"] = {
            adapter: "agora",
            transport: "WebSocketIOTransport",
            url: "https://meet.aptero.co/service/agora"
        };
        //alpha
        profiles["alpha-twilio"] = {
            adapter: "twilio",
            transport: "WebSocketIOTransport",
            url: "https://alphahub.aptero.co/service/twilio/token"
        };
        profiles["alpha-agora"] = {
            adapter: "agora",
            transport: "WebSocketIOTransport",
            url: "https://alphahub.aptero.co/service/agora"
        };
        return profiles;
    }


}
