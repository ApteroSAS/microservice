import 'module-alias/register';
import {properties} from "@root/properties/properties";

import PostgrestController from "@root/postgrest/PostgrestController";
import {JWTAuth} from "@root/jwt/JWTAuth";
import PostgrestProxy from "@root/service/room/PostgrestProxy";

export const BUILD_VERSION = require('../package.json').version;
console.log(BUILD_VERSION);

/////////
let bodyParser = require('body-parser');
let cors = require('cors');
let express = require('express');
let expressApp = express();
expressApp.use(bodyParser.json());
expressApp.use(cors());
// Parse JSON and form HTTP bodies
expressApp.use(bodyParser.urlencoded({extended: true}));

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

let jwtAuth = new JWTAuth(properties.JWT_SECRET);
let postgrestController: PostgrestController = new PostgrestController(jwtAuth, properties.POSTGREST_HOST);
let apiService: PostgrestProxy = new PostgrestProxy(postgrestController, jwtAuth);
apiService.start(expressApp);

let port = 8186;
expressApp.listen(port, () => {
    console.log('Listening on ' + port);
});
