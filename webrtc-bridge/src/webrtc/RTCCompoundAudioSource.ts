'use strict';

const {RTCAudioSink} = require('wrtc').nonstandard;
const {RTCAudioSource} = require('wrtc').nonstandard;

// TODO merge audio use RTC sink
// https://github.com/jackedgson/crunker (Use web audio api)
// https://github.com/audiojs/audio-buffer (poly fill for audio buffer)
// both code are very small we can use that directly without npm
//https://github.com/vanruesc/sparse-octree seems good

export default class RTCCompoundAudioSource {
    private volumePanner: number[];
    private scheduled: NodeJS.Timeout;
    private panning: number;
    private channelCount: number;
    private source: any;
    lastSampleData = {};
    private outputSamples: Int16Array;
    private data: { bitsPerSample: number; channelCount: any; numberOfFrames: number; sampleRate: any; samples: any };

    constructor(private options: any = {}) {
        options = {
            channelCount: 1,
            panning: null,
            sampleRate: 48000,
            ...options
        };

        const {
            channelCount,
            sampleRate
        } = options;
        this.channelCount = options.channelCount;

        if (channelCount !== 1 && channelCount !== 2) {
            throw new Error('channelCount must be 1 or 2');
        }

        const bitsPerSample = 16;
        const numberOfFrames = sampleRate / 100; //numberOfFrames for 10ms
        this.source = new RTCAudioSource();
        this.outputSamples = new Int16Array(channelCount * numberOfFrames);

        this.data = {
            samples: this.outputSamples,
            sampleRate,
            bitsPerSample,
            channelCount,
            numberOfFrames
        };

        this.volumePanner = [1, 1];
        this.setPanning(this.options.panning);
        let last = this.now();
        setInterval(()=>{
            let now = this.now();
            last = now;
            this.mergeAndSend();
        },10);//webrtc is set to 10ms per data sample
    }

    now(){
        //time in micro seconds
        let hrTime = process.hrtime()
        return hrTime[0] * 1000000 + hrTime[1] / 1000;
    }

    addTrack(id,track){
        const audioSink = new RTCAudioSink(track);
        const onAudioData = (samplesData) => {
            this.lastSampleData[id]=samplesData;
        };
        audioSink.addEventListener('data', onAudioData);
    }

    close = () => {
        this.options.unschedule(this.scheduled);
        this.scheduled = null;
    };

    createTrack = () => {
        return this.source.createTrack();
    };

    setPanning = newPanning => {
        if (this.channelCount === 1) {
            return;
        }
        this.panning = newPanning;
        this.volumePanner[0] = 1 - (this.panning / 100);
        this.volumePanner[1] = 1 - ((100 - this.panning) / 100);
    };

    mergeAndSend(){
        //Warnig this function needs to be very fast
        const samples = Object.keys(this.lastSampleData);
        const outputSamples = this.outputSamples;
        const data = this.data;
        const numberOfFrames = this.data.numberOfFrames;
        const channelCount = this.data.channelCount;
        if(samples.length>0) {
            outputSamples.fill(0);
        }
        samples.forEach(key => {
            let inputSampleData = this.lastSampleData[key];
            let ratio = inputSampleData.numberOfFrames / data.numberOfFrames;
            if(inputSampleData.bitsPerSample != data.bitsPerSample){
                throw new Error();
            }
            if(data.channelCount==1 && inputSampleData.channelCount==1) {
                for (let i = 0; i < numberOfFrames; i++) {
                    outputSamples[i] += this.volumePanner[0] * inputSampleData.samples[~~(i * ratio)];
                }
            }else if(inputSampleData.channelCount==1) {
                for (let i = 0; i < numberOfFrames; i++) {
                    for (let j = 0; j < channelCount; j++) {
                        outputSamples[i * channelCount + j] += this.volumePanner[j] * inputSampleData.samples[~~(i * ratio)];
                    }
                }
            }else if(inputSampleData.channelCount==2) {
                for (let i = 0; i < numberOfFrames; i++) {
                    for (let j = 0; j < channelCount; j++) {
                        outputSamples[i * channelCount + j] += this.volumePanner[j] * inputSampleData.samples[~~(i * ratio) * channelCount + j];
                    }
                }
            }else{
                throw new Error();
            }

        });
        this.source.onData(data);
    };
}
