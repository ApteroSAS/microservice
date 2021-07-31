
import 'module-alias/register';
import {RestService} from "@root/service/RestService";
import {WebServer} from "@root/service/WebServer";

export const BUILD_VERSION = require('../package.json').version;
console.log(BUILD_VERSION);

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});
const express = require('express')
let expressApp = express();

console.log("ready on 3443");
let port = 3443;
expressApp.listen(port, () => {
    new RestService(expressApp,BUILD_VERSION);
    new WebServer(expressApp);
    console.log('Listening on '+port);
});
