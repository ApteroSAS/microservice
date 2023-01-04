import axios from "axios";
import {properties} from "@root/properties/properties";

const express = require('express');

let last = new Date().getTime();

function throttle(cb, delayMs = 1000) {
    if (new Date().getTime() > last + delayMs) {
        cb();
        last = new Date().getTime();
    }
}

function getStreamName(hlsUrl: string /* https://cdn3.wowza.com/1/MGJtWTJCNmlMYlo0/VXBMK3c3/hls/live/playlist.m3u8*/) {
    hlsUrl = hlsUrl.replace("/hls/live/playlist.m3u8", "");//remove end
    return hlsUrl.substring(hlsUrl.length - 8, hlsUrl.length);
}

let cache = {} // hls_playback_url to streamid
async function getWowzaStream(hls_playback_url: string): Promise<any> {
    //player_hls_playback_url
    if (!cache[hls_playback_url]) {
        let res = await axios.get("https://api.video.wowza.com/api/v1.9/live_streams", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + properties.TOKEN
            }
        })
        for (const liveStream of res.data.live_streams) {
            let res2 = await axios.get("https://api.video.wowza.com/api/v1.9/live_streams/" + liveStream.id, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + properties.TOKEN
                }
            })
            const liveStream1 = res2.data.live_stream;
            cache[liveStream1.player_hls_playback_url] = liveStream1;
            /*let live = {
                id: 'vblffjs0',
                name: 'testph2',
                transcoder_type: 'transcoded',
                billing_mode: 'pay_as_you_go',
                broadcast_location: 'eu_belgium',
                vod_stream: false,
                recording: false,
                save_asset: false,
                closed_caption_type: 'none',
                low_latency: false,
                encoder: 'other_webrtc',
                delivery_method: 'push',
                playback_stream_name: 'ff0bc8be',
                target_delivery_protocol: 'hls-https',
                use_stream_source: false,
                aspect_ratio_width: 1280,
                aspect_ratio_height: 720,
                delivery_protocols: ['rtmp', 'rtsp', 'wowz', 'hls', 'webrtc'],
                source_connection_information: {
                    sdp_url: 'wss://1f04ac.entrypoint.cloud.wowza.com/webrtc-session.json',
                    application_name: 'app-8146W177',
                    stream_name: 'VXBMK3c3'
                },
                player_id: 'r0wv0fcs',
                player_type: 'original_html5',
                player_responsive: false,
                player_hls_playback_url = "https://cdn3.wowza.com/1/MGJtWTJCNmlMYlo0/VXBMK3c3/hls/live/playlist.m3u8",
                hosted_page_sharing_icons: true,
                stream_targets: [[Object]],
                direct_playback_urls: {
                    hls: [Array],
                    rtmp: [Array],
                    rtsp: [Array],
                    wowz: [Array],
                    webrtc: [Array]
                },
                created_at: '2022-11-18T18:40:55.000Z',
                updated_at: '2023-01-03T15:17:33.000Z'
            }*/
        }
    }
    console.log(cache);
    return cache[hls_playback_url];
}

export default class WowzaApiService {
    public expressApp;

    constructor() {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        //must be high availability
        router.get('/ping', async (req, res) => {
            try {
                //TODO return true of false if the stream is not loaded
                //TODO start the stream if needed
                let url = decodeURIComponent(req.query.url); // like https://cdn3.wowza.com/1/MGJtWTJCNmlMYlo0/VXBMK3c3/hls/live/playlist.m3u8
                let streamOn = false;
                try {
                    const response = await axios.get(url);
                    if(response.status == 200){
                        /*
                        #EXTM3U
                        #EXT-X-VERSION:3
                        #EXT-X-STREAM-INF:BANDWIDTH=2103124,CODECS="avc1.100.31,mp4a.40.2",RESOLUTION=1280x720
                        ../1l3xf7wf/2728/chunklist.m3u8
                        #EXT-X-STREAM-INF:BANDWIDTH=1368185,CODECS="avc1.77.31,mp4a.40.2",RESOLUTION=854x480
                        ../1l3xf7wf/1728/chunklist.m3u8
                        #EXT-X-STREAM-INF:BANDWIDTH=940669,CODECS="avc1.77.30,mp4a.40.2",RESOLUTION=640x360
                        ../1l3xf7wf/1152/chunklist.m3u8
                        #EXT-X-STREAM-INF:BANDWIDTH=553629,CODECS="avc1.66.21,mp4a.40.2",RESOLUTION=512x288
                        ../1l3xf7wf/640/chunklist.m3u8
                        #EXT-X-STREAM-INF:BANDWIDTH=408113,CODECS="avc1.66.13,mp4a.40.2",RESOLUTION=320x180
                        ../1l3xf7wf/448/chunklist.m3u8
                        */
                        const split = response.data.split(/\r?\n/);
                        let lastPart = split[split.length-2];
                        lastPart = lastPart.replaceAll("../","");
                        if(!lastPart.endsWith("chunklist.m3u8")){
                            throw new Error();
                        }
                        const newUrl = url.replace("live/playlist.m3u8",lastPart);
                        const responseChunk = await axios.get(newUrl);
                        streamOn = responseChunk.status === 200;
                    }
                } catch (e) {
                    streamOn = false;
                }
                if (!streamOn) {
                    throttle(async () => {
                        const streamName = getStreamName(url);
                        let liveStreamId = (await getWowzaStream(url)).id;
                        console.log("wake up : " + streamName + " / " + liveStreamId);
                        const response = await axios.put("https://api.video.wowza.com/api/v1.9/live_streams/" + liveStreamId + "/start", {}, {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + properties.TOKEN
                            }
                        });
                        console.log(response);
                        /*
                        curl -X PUT \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${WV_JWT}" \
                        "https://api.video.wowza.com/api/v1.9/live_streams/[live_stream_id]/start"
                         */
                    }, 5000);
                }
                //1get live stream id
                //let data = await this.balancerApi.getMetaForRoom(url);
                res.json(streamOn);
            } catch (e) {
                console.error(e);
                res.json(e);
            }
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}
