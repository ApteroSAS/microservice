require('dotenv').config();
import 'module-alias/register';
import cors from "cors";

import express from "express";
import MicrosoftApiService from "@root/service/room/MicrosoftApiService";

export const BUILD_VERSION = require('../version.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

let expressApp = express();
expressApp.use(cors());

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

//https://github.com/microsoftgraph/msgraph-training-nodeexpressapp
//https://docs.microsoft.com/en-us/graph/auth-v2-service
//https://login.microsoftonline.com/common/adminconsent?client_id=91f77dd6-131c-4d70-83c6-00dab476039d&state=12345&redirect_uri=https://caf8-149-14-155-106.eu.ngrok.io/oauth/callback

let port = 8187;
expressApp.listen(port, () => {
    new MicrosoftApiService().start(expressApp);
    console.log('Listening on ' + port);
});
