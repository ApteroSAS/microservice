
const express = require('express')

export class WebServer {
    constructor(private app){
        app.use('/static', express.static('public'));
        //app.use('/static/manage', express.static('public/manage'))
        //app.use('/static/manage/vnc', express.static('public/manage/vnc'));
    }
}