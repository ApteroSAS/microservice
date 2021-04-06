import 'module-alias/register';
import {properties} from "@root/properties/properties";
const express = require('express')
const app = express()
let bodyParser = require('body-parser');

let cors = require('cors');
import MailApiService from "@root/service/mail/MailApiService";
import MailService from './service/mail/MailService';

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

let port = 8192;
expressApp.listen(port, () => {
    let mailService = new MailService();
    let apiService: MailApiService = new MailApiService(mailService);
    apiService.start(expressApp);
    console.log('Listening on '+port);
});
