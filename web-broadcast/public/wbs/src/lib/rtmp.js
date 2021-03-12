var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
const io = require('socket.io-client');

inherits(Rtmp, EventEmitter)

const socket_address = "/";
const rtmpBaseUpload = "rtmp://rtmp.aptero.co:1935/stream/";
const rtmpBaseLink = "https://rtmp.aptero.co/live/";//.m3u8

function Rtmp() {
  var self = this
  self.socket = null
  self.url = null
  self.token = null
  self.generateUrls();
}

Rtmp.prototype.stopStreaming = function () {
  var self = this
  self.mediaRecorder.stop();
}

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

Rtmp.prototype.getHttpLink = function () {
  var self = this
  return rtmpBaseLink+self.token+".m3u8"
}

Rtmp.prototype.getRtmpLink = function () {
  var self = this
  return self.url;
}

Rtmp.prototype.generateUrls = function () {
  var self = this
  self.token = makeid(8);
  self.url = rtmpBaseUpload+self.token;
}

Rtmp.prototype.startStreaming = function (stream) {
  var self = this
  var url = self.url;
  self.socket.emit('config_rtmpDestination', url);
  self.socket.emit('start', 'start');
  self.mediaRecorder = new MediaRecorder(stream);
  self.mediaRecorder.start(250);

  self.mediaRecorder.onstop = function (e) {
    console.log("stopped!");
    console.log(e);
  }

  self.mediaRecorder.onpause = function (e) {
    console.log("media recorder paused!!");
    console.log(e);
  }

  self.mediaRecorder.onerror = function (event) {
    let error = event.error;
    console.log("error", error.name);
  };

  self.mediaRecorder.ondataavailable = function (e) {
    self.socket.emit("binarystream", e.data);
    state = "start";
  }
}

Rtmp.prototype.connectServer = function () {
  var self = this

  var socketOptions = {
    secure: true,
    reconnection: true,
    reconnectionDelay: 1000,
    timeout: 15000,
    pingTimeout: 15000,
    pingInterval: 45000,
    query: {
      framespersecond: 24,
      audioBitrate: 22050
    }
  };

  //start socket connection
  self.socket = io.connect(socket_address, socketOptions);

  self.socket.on('connect_timeout', (timeout) => {
    console.log("state on connection timeout= " + timeout);

  });
  self.socket.on('error', (error) => {
    console.log("state on connection error= " + error);
  });

  self.socket.on('connect_error', function (err) {
    console.log("state on connection error= ", err);
  });

  self.socket.on('message', function (m) {
    console.log("state on message= " + state);
    console.log('recv server message', m);
    console.log('SERVER:' + m);

  });

  self.socket.on('fatal', function (m) {

    console.log('Fatal ERROR: unexpected:' + m);
    //alert('Error:'+m);
    console.log("fatal socket error!!", m);
    console.log("state on fatal error= " + state);
    //already stopped and inactive
    console.log('media recorder restarted');

    if (oo.checked) {
      //timedCount();
      console.log("server is reloading!");
    }
    //should reload?
  });

  self.socket.on('ffmpeg_stderr', function (m) {
    //this is the ffmpeg output for each frame
    console.log('FFMPEG:' + m);
  });

  self.socket.on('disconnect', function (reason) {
    console.log("state disconec= " + state);
    console.log('ERROR: server disconnected!');
    console.log('ERROR: server disconnected!' + reason);
    recordingCircle.style.fill = 'gray';
    //reconnect the server
    connect_server();

    //socket.open();
    //mediaRecorder.stop();
    //state="stop";
    //button_start.disabled=true;
    //button_server.disabled=false;
    //	document.getElementById('button_start').disabled=true;　
    //var oo=document.getElementById("checkbox_Reconection");
    if (oo.checked) {
      //timedCount();
      output_message.innerHTML = "server is reloading!";
      console.log("server is reloading!");
    }
  });

  state = "ready";
  console.log("state = " + state);
  console.log("connect server successful");
}


module.exports = new Rtmp()