import 'module-alias/register';
import RoomDataBase from "@root/service/room/RoomDataBase";
import RoomApiService from "@root/service/room/RoomApiService";
import cors from "cors";

import express from "express";
import {GraphQLService} from "@root/service/room/GraphQLService";
import {ApolloService} from "@root/service/room/ApolloService";

export const BUILD_VERSION = require('../version.json').version;
console.log(new Date().toISOString());
console.log(BUILD_VERSION);

let expressApp = express();
expressApp.use(cors());

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

let graphQLService = new ApolloService();
graphQLService.start(expressApp);

let port = 8186;
expressApp.listen(port, () => {
    //let db = new RoomDataBase();
    //let apiService: RoomApiService = new RoomApiService(db);
    //apiService.start(expressApp);

    console.log('Listening on ' + port);
});
