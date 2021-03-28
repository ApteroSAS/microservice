import * as phx from "phoenix-channels";
import {Presence} from "@root/phoenix/Presence";
import {JWTAuth} from "@root/jwt/JWTAuth";

export default class PhoenixController {
    socket: phx.Socket;

    constructor(private jwt: JWTAuth, private adminUserId: string, private botkey: string) {
    }

    async connectToReticulum(params = null) {
        let socketUrl = "wss://alphahub.aptero.co";
        console.log(`Phoenix Socket URL: ${socketUrl}`);

        const socketSettings: any = {};

        if (params) {
            socketSettings.params = params;
        }

        const socket = new phx.Socket(`${socketUrl}/socket`, socketSettings);
        socket.connect();
        socket.onError(async (err) => {
            console.error(err);
        });
        socket.onClose(e => {
            console.log("phoenix closed. will reconnect soon");
        });
        this.socket = socket;
        return socket;
    }

    createHubChannelParams(authToken: string = null, permsToken: string = null) {
        /*{
            "profile": {
            "avatarId": "https://hub.aptero.co/data/avatar/A031/base.glb",
                "displayName": "Pierre"
        },
            "push_subscription_endpoint": null,
            "auth_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJyZXQiLCJleHAiOjE2MjM2Nzc4NzUsImlhdCI6MTYxNjQyMDI3NSwiaXNzIjoicmV0IiwianRpIjoiMTBkMWFkZmYtYjBlMi00N2RkLWFiMTgtMjY3MGY0ZDVhMTFkIiwibmJmIjoxNjE2NDIwMjc0LCJzdWIiOiI2NDA0MDcwNTA5NjYyNjk5NjEiLCJ0eXAiOiJhY2Nlc3MifQ.qp29Ip4AKkpRPtVVOUikytL1u-lGPJidUglsWlW8H9izgdRsoH_c0yZuA04Miwi6K2iN-GsoCr8Kd1fTH0yp2g",
            "perms_token": null,
            "context": {
            "mobile": false,
                "embed": true
        },
            "hub_invite_id": null
        }*/
        const params = {
            profile: {
                avatarId: "",
                displayName: ""
            },
            push_subscription_endpoint: null,
            auth_token: null,
            perms_token: null,
            bot_access_key: this.botkey,
            context: {
                mobile: false,
                embed: true
            },
            hub_invite_id: null
        };

        if (permsToken) {
            params.perms_token = permsToken;
        }

        if (authToken) {
            params.auth_token = authToken;
        }

        return params;
    };

    async connectToRoom(id: string, socket: phx.Socket = null) {
        return new Promise<any>(async (resolve, reject) => {
            if (!socket) {
                if (!this.socket) {
                    this.socket = await this.connectToReticulum();
                }
                socket = this.socket;
            }
            {
                const hubPhxChannel = socket.channel(`ret`, {hub_id: id});
                hubPhxChannel
                    .join()
                    .receive("ok", async data => {
                        let authToken = await this.jwt.createUserJWT(this.adminUserId, data.session_id);
                        console.log(authToken);
                        const hubPhxChannel = socket.channel(`hub:${id}`, this.createHubChannelParams(authToken));
                        hubPhxChannel.join().receive("ok", async data => {
                            resolve(hubPhxChannel);
                        }).receive("error", res => {
                            console.error(res);
                        });
                    })
            }

        });
    }

    getPresence(hubPhxChannel): Presence {
        //console.log(data);
        /*hubPhxChannel.on("presence_state", newState => {
            presences = phx.Presence.syncState(presences, newState, onJoin, onLeave);
        });
        hubPhxChannel.on("presence_diff", diff => {
            presences = phx.Presence.syncDiff(presences, diff, onJoin, onLeave);
        });
        presences.list = () => {
            return phx.Presence.list(presences);
        };*/
        return new Presence(hubPhxChannel);
    }

}