import 'module-alias/register';
import {properties} from "@root/properties/properties";

let bodyParser = require('body-parser');

let cors = require('cors');
let feathers = require('@feathersjs/feathers');
let express = require('@feathersjs/express');//let express = require('express');
import PreviewApiService from "@root/service/preview/PreviewApiService";
import {ipfsFileUploadService} from "@root/service/preview/PrivateIPFSFileUploadService";
import PreviewEngine from "@root/service/preview/PreviewEngine";

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

let port = 8086;
expressApp.listen(port, () => {
    ///////////////

    let previewEngine = new PreviewEngine(properties.UPLOAD_SERVER_URL, properties.UPLOAD_SERVER_TOKEN, properties.FILE_3D_TMP_STORAGE);
    let apiService: PreviewApiService = new PreviewApiService(previewEngine);
    apiService.start(expressApp, expressApp.io);
    ///////////////


    ipfsFileUploadService.start({
        host: "ipfs.private.aptero.co",
        port: "5666",
        protocol: "http"
    }, ["https://ipfs.private.aptero.co/ipfs/"]);
    //ipfsFileUploadService.start({host:"ipfs.private.aptero.co",port:"443",protocol:"https"},["https://ipfs.private.aptero.co/ipfs/"]);
    //ipfsFileUploadService.start({host:"ipfs.funnychain.co",port:"5001",protocol:"https"},["https://ipfs.funnychain.co/ipfs/"]);

    console.log('Listening on ' + port);
});

