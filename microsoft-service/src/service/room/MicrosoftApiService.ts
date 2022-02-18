import MicrosoftAPIBridge from "@root/service/room/MicrosoftAPIBridge";

const express = require('express');

export default class MicrosoftApiService {
    public expressApp;
    public microsoftAPIBridge = new MicrosoftAPIBridge();

    constructor() {
    }

    mountAPI() {
        let router = express.Router();
        /*this.microsoftAPIBridge.getProfile().then(value => {
            console.log(value);
        })*/

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        //generate ephemeral meeting
        router.get('/user', async (req, res) => {
            res.json(this.microsoftAPIBridge.getProfile());
        });

        router.get('/oauth/callback', async (req, res) => {
                const tokenRequest = {
                    code: req.query.code,
                    scopes: process.env.OAUTH_SCOPES.split(','),
                    redirectUri: process.env.OAUTH_REDIRECT_URI
                };

                try {
                    const response:any = await this.microsoftAPIBridge.processOauthToken(tokenRequest);
                    console.error('error_msg', {
                        message: 'Access token',
                        debug: response.accessToken
                    });
                } catch (error) {
                    console.error('error_msg', {
                        message: 'Error completing authentication',
                        debug: JSON.stringify(error, Object.getOwnPropertyNames(error))
                    });
                }

                res.redirect('/');
            }
        );

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}

