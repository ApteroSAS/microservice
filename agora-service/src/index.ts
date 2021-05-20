import 'module-alias/register';
const express = require('express');
const app = express();
let bodyParser = require('body-parser');

let cors = require('cors');
import AgoraApiService from "@root/service/agora/AgoraApiService";
import AgoraService from '@root/service/agora/AgoraService';

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
    let agoraService = new AgoraService();
    let apiService: AgoraApiService = new AgoraApiService(agoraService,BUILD_VERSION);
    apiService.start(expressApp);
    console.log('Listening on '+port);
});
