import 'module-alias/register';
import {properties} from "@root/properties/properties";

let bodyParser = require('body-parser');

let cors = require('cors');
let feathers = require('@feathersjs/feathers');
let express = require('@feathersjs/express');//let express = require('express');
import LiveApiService from "@root/service/live/LiveApiService";
import LiveEngine from "@root/service/live/LiveEngine";

console.log(properties.VERSION);


let expressApp = express(feathers());
expressApp.use(bodyParser.json());
expressApp.use(cors());
// Set up REST transport
expressApp.configure(express.rest());
// Parse JSON and form HTTP bodies
expressApp.use(bodyParser.urlencoded({extended: true}));

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

let port = 8087;
expressApp.listen(port, () => {
    ///////////////

    let liveEngine = new LiveEngine(properties.JSON_DB_STORAGE);
    let apiService: LiveApiService = new LiveApiService(liveEngine);
    apiService.start(expressApp);
    ///////////////

    console.log('Listening on ' + port);
});

