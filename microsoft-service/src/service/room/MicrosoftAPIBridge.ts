import {ConfidentialClientApplication, LogLevel} from '@azure/msal-node';
import graph from '@microsoft/microsoft-graph-client';

export default class MicrosoftAPIBridge {
    private msalClient: ConfidentialClientApplication;

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

    async processOauthToken(tokenRequest){
        const response = await this.msalClient.acquireTokenByCode(tokenRequest);
    }

    async getProfile(){
        const client = this.getAuthenticatedClient(this.msalClient, "abb64646-d3e2-473d-8d13-0b6faff23605");
        const user = await client
            .api('/me')
            .select('displayName,mail,mailboxSettings,userPrincipalName')
            .get();
        return user;
    }

    async generateEphemeralMeeting(){

    }


    getAuthenticatedClient(msalClient, userId) {
        if (!msalClient || !userId) {
            throw new Error(
                `Invalid MSAL state. Client: ${msalClient ? 'present' : 'missing'}, User ID: ${userId ? 'present' : 'missing'}`);
        }

        // Initialize Graph client
        const client = graph.Client.init({
            // Implement an auth provider that gets a token
            // from the app's MSAL instance
            authProvider: async (done) => {
                try {
                    // Get the user's account
                    const account = await msalClient
                        .getTokenCache()
                        .getAccountByHomeId(userId);

                    if (account) {
                        // Attempt to get the token silently
                        // This method uses the token cache and
                        // refreshes expired tokens as needed
                        const response = await msalClient.acquireTokenSilent({
                            scopes: process.env.OAUTH_SCOPES.split(','),
                            redirectUri: process.env.OAUTH_REDIRECT_URI,
                            account: account
                        });

                        // First param to callback is the error,
                        // Set to null in success case
                        done(null, response.accessToken);
                    }
                } catch (err) {
                    console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
                    done(err, null);
                }
            }
        });

        return client;
    }
}