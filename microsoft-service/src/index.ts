require('dotenv').config();
import 'module-alias/register';
import "isomorphic-fetch";
import cors from "cors";

import express from "express";
import MicrosoftApiService from "@root/service/room/MicrosoftApiService";

export const BUILD_VERSION = require('../version.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

let bodyParser = require('body-parser');
let expressApp = express();
expressApp.use(cors());
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({extended: true}));

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

//Register the app as a bot
//https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-4.0&viewFallbackFrom=azure-bot-service-3.0&tabs=userassigned

//add a teams channel
//https://docs.microsoft.com/en-us/samples/officedev/microsoft-teams-samples/calling-and-meeting-bot-sample-v4/

//grant permission
//https://docs.microsoft.com/en-us/graph/auth-v2-service

//SETUP PERMISSION POLICY
//https://docs.microsoft.com/en-us/graph/cloud-communication-online-meeting-application-access-policy
//New-CsApplicationAccessPolicy -Identity aptero-bot-daemon-policy -AppIds "7ff5af56-47e5-4078-b6a5-d4dc0a34f68e" -Description "Aptero nodejs daemon service Bot"
//Grant-CsApplicationAccessPolicy -PolicyName aptero-bot-daemon-policy -Identity "abb64646-d3e2-473d-8d13-0b6faff23605"
//Grant-CsApplicationAccessPolicy -PolicyName aptero-bot-daemon-policy -Global


let port = 8187;
expressApp.listen(port, () => {
    new MicrosoftApiService().start(expressApp);
    console.log('Listening on ' + port);
});
