import 'module-alias/register';
import {properties} from "@root/properties/properties";
const express = require('express')
const app = express()
let bodyParser = require('body-parser');

let cors = require('cors');
import MailApiService from "@root/service/twilio/TwilioApiService";
import TwilioService from './service/twilio/TwilioService';

export const BUILD_VERSION = require('../package.json').version;
console.log(BUILD_VERSION);

let expressApp = express();
expressApp.use(bodyParser.json());
expressApp.use(cors());
// Parse JSON and form HTTP bodies
expressApp.use(bodyParser.urlencoded({extended: true}));

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

let port = 8194;
expressApp.listen(port, () => {
    let mailService = new TwilioService();
    let apiService: MailApiService = new MailApiService(mailService,BUILD_VERSION);
    apiService.start(expressApp);
    console.log('Listening on '+port);
});
