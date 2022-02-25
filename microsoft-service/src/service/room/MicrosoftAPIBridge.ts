import {ConfidentialClientApplication, LogLevel} from '@azure/msal-node';
import {generateUUID} from "@microsoft/microsoft-graph-client/lib/src/middleware/MiddlewareUtil";
import EventEmitter from 'eventemitter3';
import {ClientSecretCredential} from "@azure/identity";
import {TokenCredentialAuthenticationProvider} from "@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/TokenCredentialAuthenticationProvider";
import {Client} from "@microsoft/microsoft-graph-client";
import axios from "axios";

export default class MicrosoftAPIBridge {
    private msalClient: ConfidentialClientApplication;
    events = new EventEmitter();

    constructor() {
        // MSAL config
        const
            msalConfig = {
                auth: {
                    clientId: process.env.OAUTH_CLIENT_ID,
                    authority: process.env.OAUTH_AUTHORITY,
                    clientSecret: process.env.OAUTH_CLIENT_SECRET
                },
                system: {
                    loggerOptions: {
                        loggerCallback(loglevel, message, containsPii) {
                            console.log(message);
                        },
                        piiLoggingEnabled: false,
                        logLevel: LogLevel.Verbose,
                    }
                }
            };

        // Create msal application object
        this.msalClient = new ConfidentialClientApplication(msalConfig);
    }

    async processOauthToken(tokenRequest) {
        const response = await this.msalClient.acquireTokenByCode(tokenRequest);
    }

    async getAdminProfile() {
        const client = this.getAuthenticatedAppClient();
        const user = await client
            .api("users/" + process.env.APP_ADMIN_USER)//.select('displayName,mail,mailboxSettings,userPrincipalName')
            .get();
        return user;
    }

    notifyCallUpdate(data) {
        console.log(data);
        this.events.emit("call-update", data);
    }
    async configureAudioMixer(callid:string,sourceEmail:string,receiversEmails:string[]) {
        //https://docs.microsoft.com/en-us/graph/api/participant-configuremixer?view=graph-rest-beta&tabs=http
        const client = this.getAuthenticatedAppClient();
        let sourceLevels = [];
        for(const email of receiversEmails){
            const constUser1 = await this.getUserFromMail(email);
            const id =constUser1.value[0].id;
            sourceLevels.push(
                {
                    participant: id,
                    level: 100,
                    duckOthers: false
                })
        }
        const sourceId = (await this.getUserFromMail(sourceEmail)).value[0].id;

        const participant = {
            clientContext: generateUUID(),
            participantMixerLevels: [
                {
                    participant: sourceId,
                    exclusive: true,
                    ducking: {
                        rampActive: 50,
                        rampInactive: 50,
                        lowerLevel: 10,
                        upperLevel: 50
                    },
                    sourceLevels: sourceLevels
                }
            ]
        };

        const credential = new ClientSecretCredential(process.env.TENANT_ID, process.env.APP_CLIENT_ID, process.env.APP_CLIENT_SECRET);
        const authProvider = new TokenCredentialAuthenticationProvider(credential, {
            scopes: ['https://graph.microsoft.com/.default']
        });
        const ret = await axios.post("https://graph.microsoft.com/beta/communications/calls/"+callid+"/participants/configureMixer",participant,{
            headers:{
                Authorization: "Bearer "+await authProvider.getAccessToken()
            }
        });

        return ret;
    }

    async configureAudioMixerV1(callid:string,sourceEmail:string,receiversEmails:string[]) {
        //https://docs.microsoft.com/en-us/graph/api/participant-configuremixer?view=graph-rest-beta&tabs=http
        const client = this.getAuthenticatedAppClient();
        let sourceLevels = [];
        for(const email of receiversEmails){
            const constUser1 = await this.getUserFromMail(email);
            const id =constUser1.value[0].id;
            sourceLevels.push(
                {
                    participant: id,
                    level: 100,
                    duckOthers: false,
                    tenantId: process.env.TENANT_ID
                })
        }
        const sourceId = (await this.getUserFromMail(sourceEmail)).value[0].id;

        const participant = {
            clientContext: generateUUID(),
            participantMixerLevels: [
                {
                    participant: sourceId,
                    tenantId: process.env.TENANT_ID,
                    exclusive: true,
                    ducking: {
                        rampActive: 50,
                        rampInactive: 50,
                        lowerLevel: 10,
                        upperLevel: 50
                    },
                    sourceLevels: sourceLevels
                }
            ],
            tenantId: process.env.TENANT_ID
        };

        const ret = await client.api('/communications/calls/'+callid+'/participants/configureMixer')
            .version("1.0")
            .post(participant);
        return ret;
    }

    async createAudioRouting(callid:string,sourceEmail:string,receiversEmails:string[]) {
        //https://docs.microsoft.com/en-us/graph/api/application-post-calls?view=graph-rest-1.0&tabs=http
        const client = this.getAuthenticatedAppClient();
        let ids = [];
        for(const email of receiversEmails){
            const constUser1 = await this.getUserFromMail(email);
            const id =constUser1.value[0].id;
            ids.push(id);
        }
        const sourceId = (await this.getUserFromMail(sourceEmail)).value[0].id;

        const audioRoutingGroup = {
            id: generateUUID(),
            routingMode: 'multicast',
            sources: [
                sourceId
            ],
            receivers: ids
        };
        let ret = await client.api('/communications/calls/'+callid+'/audioRoutingGroups').version("beta").post(audioRoutingGroup);
        return ret;
    }

    async createMultiCall(emails:string[]) {
        //https://docs.microsoft.com/en-us/graph/api/application-post-calls?view=graph-rest-1.0&tabs=http
        const client = this.getAuthenticatedAppClient();
        let targets = [];
        for(const email of emails){
            const constUser1 = await this.getUserFromMail(email);
            const id =constUser1.value[0].id;
            targets.push({
                "@odata.type": "#microsoft.graph.invitationParticipantInfo",
                "identity": {
                    "@odata.type": "#microsoft.graph.identitySet",
                    "user": {
                        "@odata.type": "#microsoft.graph.identity",
                        "displayName": "user1",
                        "id": id,
                        tenantId: process.env.TENANT_ID
                    }
                }
            })
        }

        const call = {
            "@odata.type": "#microsoft.graph.call",
            "direction": "outgoing",
            "subject": "Create a group call with service hosted media",
            "callbackUri": process.env.CALLBACK_URL + "/api/messages",
            "source": {
                "@odata.type": "#microsoft.graph.participantInfo",
                "identity": {
                    "@odata.type": "#microsoft.graph.identitySet",
                    "application": {
                        "@odata.type": "#microsoft.graph.identity",
                        "displayName": "Aptero Bot",
                        "id": process.env.APP_CLIENT_ID,
                        tenantId: process.env.TENANT_ID
                    }
                }
            },
            "targets": targets,
            "requestedModalities": [
                "audio"
            ],
            "mediaConfig": {
                "@odata.type": "#microsoft.graph.serviceHostedMediaConfig",
                "removeFromDefaultAudioGroup": false
            },
            tenantId: process.env.TENANT_ID
        };
        let callId = "";
        let confirmation = new Promise(resolve => {
            let fct = args => {
                let callRessourceId = args.value[0].resource;
                if (callRessourceId === "/app/calls/" + callId) {
                    resolve(callId);
                    console.log("call established :" + callId);
                    this.events.off("call-update", fct);
                }
            };
            this.events.on("call-update", fct);
        });
        let ret = await client.api('/communications/calls').version('beta').post(call);
        callId = (await ret).id;
        await confirmation;
        return ret;
        /*
        {
          '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#communications/calls/$entity',
          id: '841f5e00-a366-4d78-a911-b880a3158dcd',
          state: 'establishing',
          transferState: null,
          terminationReason: null,
          direction: 'outgoing',
          ringingTimeoutInSeconds: null,
          subject: null,
          callbackUri: 'https://e819-2001-861-36c3-d030-759c-5a8b-808b-6399.ngrok.io/api/messages',
          requestedModalities: [ 'audio' ],
          activeModalities: [],
          routingPolicies: [],
          tenantId: '48caed5d-d20d-40ce-b0cd-9261fc5d8f83',
          myParticipantId: 'db729179-c5f8-4fbb-841b-202ee728af8c',
          callChainId: 'c6c754ad-31bf-441b-af0f-537fa5bd8782',
          mediaHostedRegion: null,
          mediaState: null,
          resultInfo: null,
          answeredBy: null,
          chatInfo: null,
          meetingInfo: null,
          transcription: null,
          callOptions: null,
          meetingCapability: null,
          breakoutDetails: null,
          pstnDetails: null,
          toneInfo: null,
          incomingContext: null,
          terminationSender: null,
          callRoutes: [],
          source: {
            endpointType: null,
            region: null,
            languageId: null,
            countryCode: null,
            participantId: null,
            identity: {
              user: null,
              phone: null,
              guest: null,
              encrypted: null,
              onPremises: null,
              applicationInstance: null,
              device: null,
              application: [Object]
            }
          },
          targets: [
            {
              endpointType: null,
              replacesCallId: null,
              hidden: null,
              removeFromDefaultAudioRoutingGroup: null,
              participantId: null,
              identity: [Object]
            }
          ],
          mediaConfig: {
            '@odata.type': '#microsoft.graph.serviceHostedMediaConfig',
            preFetchMedia: []
          }
        }
         */
    }

    async createCall() {
        //https://docs.microsoft.com/en-us/graph/api/application-post-calls?view=graph-rest-1.0&tabs=http
        const client = this.getAuthenticatedAppClient();
        const call = {
            '@odata.type': '#microsoft.graph.call',
            "callbackUri": process.env.CALLBACK_URL + "/api/messages",
            targets: [
                {
                    '@odata.type': '#microsoft.graph.invitationParticipantInfo',
                    identity: {
                        '@odata.type': '#microsoft.graph.identitySet',
                        user: {
                            '@odata.type': '#microsoft.graph.identity',
                            displayName: 'Admin',
                            id: process.env.APP_ADMIN_USER,
                            tenantId: process.env.TENANT_ID
                        }
                    }
                }
            ],
            requestedModalities: [
                'audio'
            ],
            mediaConfig: {
                '@odata.type': '#microsoft.graph.serviceHostedMediaConfig'
            },
            tenantId: process.env.TENANT_ID
        };
        let callId = "";
        let confirmation = new Promise(resolve => {
            let fct = args => {
                let callRessourceId = args.value[0].resource;
                if (callRessourceId === "/app/calls/" + callId) {
                    resolve(callId);
                    console.log("call established :" + callId);
                    this.events.off("call-update", fct);
                }
            };
            this.events.on("call-update", fct);
        });
        let ret = await client.api('/communications/calls').post(call);
        callId = (await ret).id;
        await confirmation;
        return ret;
        /*
        {
          '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#communications/calls/$entity',
          id: '841f5e00-a366-4d78-a911-b880a3158dcd',
          state: 'establishing',
          transferState: null,
          terminationReason: null,
          direction: 'outgoing',
          ringingTimeoutInSeconds: null,
          subject: null,
          callbackUri: 'https://e819-2001-861-36c3-d030-759c-5a8b-808b-6399.ngrok.io/api/messages',
          requestedModalities: [ 'audio' ],
          activeModalities: [],
          routingPolicies: [],
          tenantId: '48caed5d-d20d-40ce-b0cd-9261fc5d8f83',
          myParticipantId: 'db729179-c5f8-4fbb-841b-202ee728af8c',
          callChainId: 'c6c754ad-31bf-441b-af0f-537fa5bd8782',
          mediaHostedRegion: null,
          mediaState: null,
          resultInfo: null,
          answeredBy: null,
          chatInfo: null,
          meetingInfo: null,
          transcription: null,
          callOptions: null,
          meetingCapability: null,
          breakoutDetails: null,
          pstnDetails: null,
          toneInfo: null,
          incomingContext: null,
          terminationSender: null,
          callRoutes: [],
          source: {
            endpointType: null,
            region: null,
            languageId: null,
            countryCode: null,
            participantId: null,
            identity: {
              user: null,
              phone: null,
              guest: null,
              encrypted: null,
              onPremises: null,
              applicationInstance: null,
              device: null,
              application: [Object]
            }
          },
          targets: [
            {
              endpointType: null,
              replacesCallId: null,
              hidden: null,
              removeFromDefaultAudioRoutingGroup: null,
              participantId: null,
              identity: [Object]
            }
          ],
          mediaConfig: {
            '@odata.type': '#microsoft.graph.serviceHostedMediaConfig',
            preFetchMedia: []
          }
        }
         */
    }

    async createOnlineMeeting() {
        const client = this.getAuthenticatedAppClient();
        let date = "2022-02-18T14:00";
        const onlineMeeting = {
            startDateTime: date + ':00.0000000+01:00',
            endDateTime: date + ':00.0000000+00:00',
            subject: 'User Token Meeting',
            lobbyBypassSettings: {scope: 'everyone', isDialInBypassEnabled: true}
        };
        const user = await client
            .api('users/' + process.env.APP_ADMIN_USER + '/onlineMeetings')
            .post(onlineMeeting);
        return user;
    }

    async inviteUser() {

        const callId: string = (await this.createCall()).id;
        //const callId:string = "841f5e00-a366-4d78-a911-b880a3158dcd";
        //https://graph.microsoft.com/v1.0/communications/calls//participants/invite
        const client = this.getAuthenticatedAppClient();
        const constUser = await this.getUserFromMail("pierre.henri@aptero.co");
        const userId = constUser.value[0].id;
        const invitData = {
            "participants": [
                {
                    "@odata.type": "#microsoft.graph.invitationParticipantInfo",
                    "replacesCallId": process.env.APP_CLIENT_ID,
                    "identity": {
                        "@odata.type": "#microsoft.graph.identitySet",
                        "user": {
                            "@odata.type": "#microsoft.graph.identity",
                            "id": userId,
                            "displayName": "Display Name Test",
                            tenantId: process.env.TENANT_ID
                        }
                    }
                }
            ],
            tenantId: process.env.TENANT_ID,
            "clientContext": generateUUID()
        };

        client.api('communications/calls/' + callId + "/participants/invite").post(invitData);
    }

    async getUserFromMail(mail) {
        const client = this.getAuthenticatedAppClient();
        const user = await client
            .api('users/')
            .filter("mail eq '" + mail + "'")
            .get();
        return user;
    }

    async getOnlineMeeting() {
        const client = this.getAuthenticatedAppClient();
        let url = "https://teams.microsoft.com/l/meetup-join/19%3ameeting_ZGI1MWMwMTYtNzgwNy00N2Q3LWJlMjctMGRlZjJkZDJhMWEx%40thread.v2/0?context=%7b%22Tid%22%3a%2248caed5d-d20d-40ce-b0cd-9261fc5d8f83%22%2c%22Oid%22%3a%22abb64646-d3e2-473d-8d13-0b6faff23605%22%7d";
        const user = await client
            .api('users/' + process.env.APP_ADMIN_USER + '/onlineMeetings')
            .filter("JoinWebUrl eq '" + url + "'")
            //.select('displayName,mail,mailboxSettings,userPrincipalName')
            .get();
        return user;
    }

    getAuthenticatedAppClient(defaultVersion=undefined) {
        const credential = new ClientSecretCredential(process.env.TENANT_ID, process.env.APP_CLIENT_ID, process.env.APP_CLIENT_SECRET);
        const authProvider = new TokenCredentialAuthenticationProvider(credential, {
            scopes: ['https://graph.microsoft.com/.default']
        });
        const client = Client.initWithMiddleware({
            debugLogging: true,
            defaultVersion:"beta",
            authProvider
            // Use the authProvider object to create the class.
        });
        return client;
    }
}
