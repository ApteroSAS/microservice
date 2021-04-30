import * as mediasoupClient from "mediasoup-client";
import ProtoSignaling from "@root/webrtc/ProtoSignaling";
import {NodeWebRTCHandler} from "@root/webrtc/NodeWebRTCHandler";
const MediaStream = require('wrtc').MediaStream;

const PC_PROPRIETARY_CONSTRAINTS = {
    optional: [{ googDscp: true }]
};

export default class DialogAdapter {
    private _iceTransportPolicy:RTCIceTransportPolicy = "all";

    private signaling: ProtoSignaling;
    private _serverUrl: string;
    private _forceTcp: boolean = false;
    public mediasoupDevice: mediasoupClient.Device;
    public _sendTransport: any;
    public _recvTransport: any;
    private _consumers = new Map();
    private _initialAudioConsumerResolvers = new Map();
    private _consumerStats:any = {};
    private _downlinkBwe: any = {};
    private _pendingMediaRequests = new Map();
    private _onOccupantConnected = (data)=>{console.log("_onOccupantConnected : "+data)};
    private _onOccupantDisconnected= (data)=>{console.log("_onOccupantDisconnected : "+data)};
    private _onOccupantMessage= ()=>{console.log("_onOccupantMessage")};
    private _onOccupantsChanged= (data)=>{console.log("_onOccupantsChanged : "+data)};
    private occupants: any = {};
    private _connectSuccess= (data)=>{console.log("_connectSuccess : "+data)};
    private _connectFailure= (data)=>{console.log("_connectFailure : "+data)};
    private _initialAudioConsumerPromise:any = null;
    private _roomId: string;
    private _clientId: string;
    private _joinToken: string;
    private _serverParams: any;
    private _micProducer: any = null;
    private _localMediaStream: any;
    private _protoo: any;
    private emitRTCEvent: any;
    private _localMediaTrack: any;
    
    constructor(){
        this.signaling = new ProtoSignaling();
        this.emitRTCEvent = this.signaling.emitRTCEvent;
    }

    setParams(serverUrl:string,roomId:string,clientId:string,joinToken:string,serverParams){
        this._serverUrl = serverUrl;
        this._roomId = roomId;
        this._clientId = clientId;
        this._joinToken = joinToken;
        this._serverParams = serverParams;
    }

    getIceServers(host, port, turn) {
        let iceServers = [];

        this._serverUrl = `wss://${host}:${port}`;

        if (turn && turn.enabled) {
            turn.transports.forEach(ts => {
                // Try both TURN DTLS and TCP/TLS
                if (!this._forceTcp) {
                    iceServers.push({
                        urls: `turns:${host}:${ts.port}`,
                        username: turn.username,
                        credential: turn.credential
                    });
                }

                iceServers.push({
                    urls: `turns:${host}:${ts.port}?transport=tcp`,
                    username: turn.username,
                    credential: turn.credential
                });
            });
            iceServers.push({ urls: "stun:stun1.l.google.com:19302" });
        } else {
            iceServers.push({ urls: "stun:stun1.l.google.com:19302" }, { urls: "stun:stun2.l.google.com:19302" });
        }
        //iceServers = addIceServers(iceServers);
        return iceServers;
    }

    setServerConnectListeners(successListener, failureListener) {
        this._connectSuccess = successListener;
        this._connectFailure = failureListener;
    }

    setOnOccupantConnected(openListener) {
        this._onOccupantConnected = openListener;
    }

    setDataChannelListeners(openListener, closedListener, messageListener) {
        this._onOccupantConnected = openListener;
        this._onOccupantDisconnected = closedListener;
        this._onOccupantMessage = messageListener;
    }

    checkSendIceStatus(connectionState) {
        // If the ICE connection state is failed, we force an ICE restart
        if (connectionState === "failed") {
            //this.restartSendICE(); //TODO
            console.error(connectionState);
        }
    }

    checkRecvIceStatus(connectionState) {
        // If the ICE connection state is failed, we force an ICE restart
        if (connectionState === "failed") {
            //this.restartRecvICE(); //TODO
            console.error(connectionState);
        }
    }

    async connect() {
        await this.signaling.connect(this._serverUrl,this._roomId,this._clientId,this.joinRoom);

        // eslint-disable-next-line no-unused-vars
        this._protoo.on("request", async (request, accept, reject) => {
            this.emitRTCEvent("info", "Signaling", () => `Request [${request.method}]: ${request.data.id}`);
            switch (request.method) {
                case "newConsumer": {
                    const {
                        peerId,
                        producerId,
                        id,
                        kind,
                        rtpParameters,
                        /*type, */ appData /*, producerPaused */
                    } = request.data;

                    try {
                        const consumer = await this._recvTransport.consume({
                            id,
                            producerId,
                            kind,
                            rtpParameters,
                            appData: { ...appData, peerId } // Trick.
                        });

                        // Store in the map.
                        this._consumers.set(consumer.id, consumer);

                        consumer.on("transportclose", () => {
                            this.emitRTCEvent("error", "RTC", () => `Consumer transport closed`);
                            this.removeConsumer(consumer.id);
                        });

                        if (kind === "video") {
                            const { spatialLayers, temporalLayers } = mediasoupClient.parseScalabilityMode(
                                consumer.rtpParameters.encodings[0].scalabilityMode
                            );

                            this._consumerStats[consumer.id] = this._consumerStats[consumer.id] || {};
                            this._consumerStats[consumer.id]["spatialLayers"] = spatialLayers;
                            this._consumerStats[consumer.id]["temporalLayers"] = temporalLayers;
                        }

                        // We are ready. Answer the protoo request so the server will
                        // resume this Consumer (which was paused for now if video).
                        accept();

                        this.resolvePendingMediaRequestForTrack(peerId, consumer.track);

                        if (kind === "audio") {
                            const initialAudioResolver = this._initialAudioConsumerResolvers.get(peerId);

                            if (initialAudioResolver) {
                                initialAudioResolver();
                                this._initialAudioConsumerResolvers.delete(peerId);
                            }
                        }

                        // Notify of an stream update event
                        //this.emit("stream_updated", peerId, kind);
                    } catch (err) {
                        this.emitRTCEvent("error", "Adapter", () => `Error: ${err}`);
                        throw err;
                    }

                    break;
                }
            }
        });

        this._protoo.on("notification", notification => {
            console.info('proto "notification" event [method:%s, data:%o]', notification.method, notification.data);

            switch (notification.method) {
                case "newPeer": {
                    const peer = notification.data;
                    this.newPeer(peer);

                    break;
                }

                case "peerClosed": {
                    const { peerId } = notification.data;
                    this.closePeer(peerId);

                    break;
                }

                case "consumerClosed": {
                    const { consumerId } = notification.data;
                    const consumer = this._consumers.get(consumerId);

                    if (!consumer) {
                        console.info(`consumerClosed event received without related consumer: ${consumerId}`);
                        break;
                    }

                    consumer.close();
                    this.removeConsumer(consumer.id);

                    break;
                }

                case "peerBlocked": {
                    const { peerId } = notification.data;
                    document.body.dispatchEvent(new CustomEvent("blocked", { detail: { clientId: peerId } }));

                    break;
                }

                case "peerUnblocked": {
                    const { peerId } = notification.data;
                    document.body.dispatchEvent(new CustomEvent("unblocked", { detail: { clientId: peerId } }));

                    break;
                }

                case "downlinkBwe": {
                    this._downlinkBwe = notification.data;
                    break;
                }

                case "consumerLayersChanged": {
                    const { consumerId, spatialLayer, temporalLayer } = notification.data;

                    const consumer = this._consumers.get(consumerId);

                    if (!consumer) {
                        console.info(`consumerLayersChanged event received without related consumer: ${consumerId}`);
                        break;
                    }

                    this._consumerStats[consumerId] = this._consumerStats[consumerId] || {};
                    this._consumerStats[consumerId]["spatialLayer"] = spatialLayer;
                    this._consumerStats[consumerId]["temporalLayer"] = temporalLayer;

                    // TODO: If spatialLayer/temporalLayer are null, that's probably because the current downlink
                    // it's not enough forany spatial layer bitrate. In that case the server has paused the consumer.
                    // At this point we it would be nice to give the user some visual cue that this stream is paused.
                    // ie. A grey overlay with some icon or replacing the video stream por a generic person image.
                    break;
                }

                case "consumerScore": {
                    const { consumerId, score } = notification.data;

                    const consumer = this._consumers.get(consumerId);

                    if (!consumer) {
                        console.info(`consumerScore event received without related consumer: ${consumerId}`);
                        break;
                    }

                    this._consumerStats[consumerId] = this._consumerStats[consumerId] || {};
                    this._consumerStats[consumerId]["score"] = score;
                }
            }
        });

        await Promise.all([this._initialAudioConsumerPromise]);

    }

    newPeer(peer) {
        this.occupants[peer.id] = peer;
        this._onOccupantConnected(peer.id);

        if (this._onOccupantsChanged) {
            this._onOccupantsChanged(this.occupants);
        }
    }

    closePeer(peerId) {
        this._onOccupantDisconnected(peerId);

        const pendingMediaRequests = this._pendingMediaRequests.get(peerId);

        if (pendingMediaRequests) {
            const msg = "The user disconnected before the media stream was resolved.";
            console.info(msg);

            if (pendingMediaRequests.audio) {
                pendingMediaRequests.audio.resolve(null);
            }

            if (pendingMediaRequests.video) {
                pendingMediaRequests.video.resolve(null);
            }

            this._pendingMediaRequests.delete(peerId);
        }

        // Resolve initial audio resolver since this person left.
        const initialAudioResolver = this._initialAudioConsumerResolvers.get(peerId);

        if (initialAudioResolver) {
            initialAudioResolver();

            this._initialAudioConsumerResolvers.delete(peerId);
        }

        delete this.occupants[peerId];

        if (this._onOccupantsChanged) {
            this._onOccupantsChanged(this.occupants);
        }
    }

    resolvePendingMediaRequestForTrack(clientId, track) {
        const requests = this._pendingMediaRequests.get(clientId);

        if (requests && requests[track.kind]) {
            const resolve = requests[track.kind].resolve;
            delete requests[track.kind];
            resolve(new MediaStream([track]));
        }

        if (requests && Object.keys(requests).length === 0) {
            this._pendingMediaRequests.delete(clientId);
        }
    }

    removeConsumer(consumerId) {
        this.emitRTCEvent("info", "RTC", () => `Consumer removed: ${consumerId}`);
        this._consumers.delete(consumerId);
    }

    async createSendTransport(iceServers) {
        // Create mediasoup Transport for sending (unless we don't want to produce).
        const sendTransportInfo = await this._protoo.request("createWebRtcTransport", {
            producing: true,
            consuming: false,
            sctpCapabilities: undefined
        });

        this._sendTransport = this.mediasoupDevice.createSendTransport({
            id: sendTransportInfo.id,
            iceParameters: sendTransportInfo.iceParameters,
            iceCandidates: sendTransportInfo.iceCandidates,
            dtlsParameters: sendTransportInfo.dtlsParameters,
            sctpParameters: sendTransportInfo.sctpParameters,
            iceServers,
            iceTransportPolicy: this._iceTransportPolicy,
            proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
        });

        this._sendTransport.on("connect", (
            { dtlsParameters },
            callback,
            errback // eslint-disable-line no-shadow
        ) => {
            this.emitRTCEvent("info", "RTC", () => `Send transport [connect]`);
            this._sendTransport.observer.on("close", () => {
                this.emitRTCEvent("info", "RTC", () => `Send transport [close]`);
                !(this._sendTransport && this._sendTransport._closed) && this._sendTransport.close();
            });
            this._sendTransport.observer.on("newproducer", producer => {
                this.emitRTCEvent("info", "RTC", () => `Send transport [newproducer]: ${producer.id}`);
            });
            this._sendTransport.observer.on("newconsumer", consumer => {
                this.emitRTCEvent("info", "RTC", () => `Send transport [newconsumer]: ${consumer.id}`);
            });

            this._protoo
                .request("connectWebRtcTransport", {
                    transportId: this._sendTransport.id,
                    dtlsParameters
                })
                .then(callback)
                .catch(errback);
        });

        this._sendTransport.on("connectionstatechange", connectionState => {
            let level = "info";
            if (connectionState === "failed" || connectionState === "disconnected") {
                level = "error";
            }
            this.emitRTCEvent(level, "RTC", () => `Send transport [connectionstatechange]: ${connectionState}`);

            this.checkSendIceStatus(connectionState);
        });

        this._sendTransport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
            this.emitRTCEvent("info", "RTC", () => `Send transport [produce]: ${kind}`);
            try {
                // eslint-disable-next-line no-shadow
                const { id } = await this._protoo.request("produce", {
                    transportId: this._sendTransport.id,
                    kind,
                    rtpParameters,
                    appData
                });

                callback({ id });
            } catch (error) {
                this.emitRTCEvent("error", "Signaling", () => `[produce] error: ${error}`);
                errback(error);
            }
        });

        if (this._localMediaTrack) {
            this.createMissingProducers(this._localMediaTrack);
        }
    }

    async createRecvTransport(iceServers) {
        // Create mediasoup Transport for sending (unless we don't want to consume).
        const recvTransportInfo = await this._protoo.request("createWebRtcTransport", {
            producing: false,
            consuming: true,
            sctpCapabilities: undefined
        });

        this._recvTransport = this.mediasoupDevice.createRecvTransport({
            id: recvTransportInfo.id,
            iceParameters: recvTransportInfo.iceParameters,
            iceCandidates: recvTransportInfo.iceCandidates,
            dtlsParameters: recvTransportInfo.dtlsParameters,
            sctpParameters: recvTransportInfo.sctpParameters,
            iceServers,
            iceTransportPolicy: this._iceTransportPolicy
        });

        this._recvTransport.on("connect", (
            { dtlsParameters },
            callback,
            errback // eslint-disable-line no-shadow
        ) => {
            this.emitRTCEvent("info", "RTC", () => `Receive transport [connect]`);
            this._recvTransport.observer.on("close", () => {
                this.emitRTCEvent("info", "RTC", () => `Receive transport [close]`);
                !(this._recvTransport && this._recvTransport._closed) && this._recvTransport.close();
            });
            this._recvTransport.observer.on("newproducer", producer => {
                this.emitRTCEvent("info", "RTC", () => `Receive transport [newproducer]: ${producer.id}`);
            });
            this._recvTransport.observer.on("newconsumer", consumer => {
                this.emitRTCEvent("info", "RTC", () => `Receive transport [newconsumer]: ${consumer.id}`);
            });

            this._protoo
                .request("connectWebRtcTransport", {
                    transportId: this._recvTransport.id,
                    dtlsParameters
                })
                .then(callback)
                .catch(errback);
        });

        this._recvTransport.on("connectionstatechange", connectionState => {
            let level = "info";
            if (connectionState === "failed" || connectionState === "disconnected") {
                level = "error";
            }
            this.emitRTCEvent(level, "RTC", () => `Receive transport [connectionstatechange]: ${connectionState}`);

            this.checkRecvIceStatus(connectionState);
        });
    }

    joinRoom = async ()=>{
        this._protoo = this.signaling._protoo;
        // Create a device (use browser auto-detection).
        this.mediasoupDevice = new mediasoupClient.Device({handlerFactory:NodeWebRTCHandler.createFactory()});

        // Communicate with our server app to retrieve router RTP capabilities.
        const routerRtpCapabilities = await this._protoo.request('getRouterRtpCapabilities');

        // Load the device with the router RTP capabilities.
        await this.mediasoupDevice.load({routerRtpCapabilities});

        const { host, port, turn } = this._serverParams;
        const iceServers = this.getIceServers(host, port, turn);

        await this.createSendTransport(iceServers);
        await this.createRecvTransport(iceServers);

        const { peers } = await this._protoo.request("join", {
            displayName: this._clientId,
            device: undefined,
            rtpCapabilities: this.mediasoupDevice.rtpCapabilities,
            sctpCapabilities: undefined,
            token: this._joinToken
        });

        const audioConsumerPromises = [];
        this.occupants = {};

        // Create a promise that will be resolved once we attach to all the initial consumers.
        // This will gate the connection flow until all voices will be heard.
        for (let i = 0; i < peers.length; i++) {
            const peerId = peers[i].id;
            this._onOccupantConnected(peerId);
            this.occupants[peerId] = peers[i];
            if (!peers[i].hasProducers) continue;
            audioConsumerPromises.push(new Promise(res => this._initialAudioConsumerResolvers.set(peerId, res)));
        }

        this._connectSuccess(this._clientId);
        this._initialAudioConsumerPromise = Promise.all(audioConsumerPromises);

        if (this._onOccupantsChanged) {
            this._onOccupantsChanged(this.occupants);
        }
    }

    setLocalMediaStream(stream) {
        this.createMissingProducers(stream);
    }

    async createMissingProducers(track) {
        this.emitRTCEvent("info", "RTC", () => `Creating missing producers`);

        if (!this._sendTransport) return;
        let sawAudio = false;

        if (track.kind === "audio") {
            sawAudio = true;

            // TODO multiple audio tracks?
            if (this._micProducer) {
                if (this._micProducer.track !== track) {
                    this._micProducer.track.stop();
                    this._micProducer.replaceTrack(track);
                }
            } else {
                await this.enabledMic(track);
            }
        }
        this.resolvePendingMediaRequestForTrack(this._clientId, track);

        if (!sawAudio && this._micProducer) {
            this._micProducer.close();
            this._protoo.request("closeProducer", { producerId: this._micProducer.id });
            this._micProducer = null;
        }

        this._localMediaTrack = track;
    }

    async enabledMic(track) {
        // stopTracks = false because otherwise the track will end during a temporary disconnect
        this._micProducer = await this._sendTransport.produce({
            track,
            stopTracks: false,
            codecOptions: { opusStereo: false, opusDtx: true },
            zeroRtpOnPause: true,
            disableTrackOnPause: true
        });

        this._micProducer.on("transportclose", () => {
            this.emitRTCEvent("info", "RTC", () => `Mic transport closed`);
            this._micProducer = null;
        });
    }

    async getMediaStream(clientId, kind = "audio"):Promise<any> {
        let track;

        if (this._clientId === clientId) {
            if (kind === "audio" && this._micProducer) {
                track = this._micProducer.track;
            }
        } else {
            this._consumers.forEach(consumer => {
                if (consumer.appData.peerId === clientId && kind == consumer.track.kind) {
                    track = consumer.track;
                }
            });
        }

        if (track) {
            console.debug(`Already had ${kind} for ${clientId}`);
            return Promise.resolve(new MediaStream([track]));
        } else {
            console.debug(`Waiting on ${kind} for ${clientId}`);
            if (!this._pendingMediaRequests.has(clientId)) {
                this._pendingMediaRequests.set(clientId, {});
            }

            const requests = this._pendingMediaRequests.get(clientId);
            const promise = new Promise((resolve, reject) => (requests[kind] = { resolve, reject }));
            requests[kind].promise = promise;
            promise.catch(e => {
                this.emitRTCEvent("error", "Adapter", () => `getMediaStream error: ${e}`);
                console.warn(`${clientId} getMediaStream Error`, e);
            });
            return promise;
        }
    }

}