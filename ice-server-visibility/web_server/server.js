/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var express = require('express');
var https = require('https');
var http = require("http");
var pem = require('pem');

pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
  console.log(err);

  var options = {
    key: keys.serviceKey,
    cert: keys.certificate,
  };

  var app = express();

  app.use(express.static("../src/"));

  // Create an HTTPS service.
  https.createServer(options, app).listen(8080);
  http.createServer(app).listen(8081);

  console.log("serving on https://localhost:8080 (secure)");
  console.log("serving on https://localhost:8081 (unsecure)");
  // console.log("serving on http://localhost:80");
});
