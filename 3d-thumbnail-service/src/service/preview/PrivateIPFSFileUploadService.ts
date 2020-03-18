import * as Fs from "fs";

const IpfsClient = require('ipfs-http-client')
import axios from 'axios'
import request = require("request");

const audit = console;

export interface UploadedDataInterface {
    fileURL: string,
    fileId: string,
}

export interface IpfsInterface {
    host: string,
    port: string,
    protocol: string
}

export interface IpfsAPIInterface {
    api: any,
    host: IpfsInterface
}

export class IPFSFileUploadService {
    ipfsMainGatways: string[] = [];
    ipfsMainGatway = this.ipfsMainGatways[0];

    ipfsNodes: IpfsInterface[] = [];
    ipfsApis: IpfsAPIInterface[] = [];

    start(api: {
        host: string,
        port: string,
        protocol: string
    }, gateways: string[]): void {
        this.ipfsNodes.push(api);
        this.ipfsMainGatways = gateways;
        this.ipfsMainGatway = this.ipfsMainGatways[0];
        //"https://ipfs.funnychain.co/ipfs/", "https://ipfs.infura.io/ipfs/", "https://ipfs.io/ipfs/"
        /*
        this.ipfsNodes.push({
            host: 'ipfs.infura.io',
            port: '5001',
            protocol: 'https'
        });
        */

        this.ipfsNodes.forEach(ipfsHost => {
            this.ipfsApis.push({
                api: IpfsClient(ipfsHost),
                host: ipfsHost
            });
        });

        this.ipfsApis.forEach(ipfsApi => {
            ipfsApi.api.version().then(version => {
                console.log("ipfs service started / version :", version, " / gateway :" + this.ipfsMainGatway, ipfsApi.host);
            })
        });
    }

    convertIPFSLinkToHttpsLink(link: string) {
        if (link.startsWith("ipfs://")) {
            link = link.replace("ipfs://", "");
        }
        return this.ipfsMainGatway + link;
    }

    convertHttpsLinkToIpfsLink(url: string): string {
        return "ipfs://" + this.convertIPFSLinkToIPFSHash(url);
    }

    convertIPFSLinkToIPFSHash(link: string) {
        return link.replace(this.ipfsMainGatway, "");
    }

    pin(ipfsId: string): Promise<string> {
        let ipfsApi = this.ipfsApis[0];//default
        return this.pinToAPIV0(ipfsId, ipfsApi);
    }

    pinToAPIV1(ipfsId: string, ipfsApi: IpfsAPIInterface): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            //https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/PIN.md#pinadd
            ipfsApi.api.pin(ipfsId, false, (err, res) => {
                if (!err) {
                    resolve("ok");
                } else {
                    audit.error("ipfs pinToAPI failed : " + ipfsApi.host.host, err);
                    reject("ipfs pinToAPI failed : " + ipfsApi.host.host);
                }
            });
        });
    }

    pinToAPIV0(ipfsId: string, ipfsApi: IpfsAPIInterface): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const httpClient = axios.create();
            httpClient.defaults.timeout = 20000;//ms
            //curl "http://localhost:5001/api/v0/pin/add?arg=<ipfs-path>&recursive=true&progress=<value>"
            let url = ipfsApi.host.protocol + "://" + ipfsApi.host.host + ":" + ipfsApi.host.port + "/api/v0/pin/add?arg=" + ipfsId;
            httpClient.get(url).then(() => {
                resolve("ok");
            }).catch((err) => {
                audit.error("ipfs pinToAPI failed : " + ipfsApi.host.host, err);
                reject("ipfs pinToAPI failed : " + ipfsApi.host.host);
            });
        });
    }

    pinMulti(ipfsId: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let error = 0;
            this.ipfsApis.forEach(ipfsApi => {
                this.pinToAPIV0(ipfsId, ipfsApi).catch(reason => {
                    //we do not care
                    error++;
                });
            });
            if (error === this.ipfsApis.length) {
                audit.warn("every pinToAPI failed: " + ipfsId);
                reject("every pinToAPI failed");
            } else {
                resolve("ok");
            }
        });
    }

    uploadFromFile(filepathOut:string): Promise<UploadedDataInterface>{
        return new Promise((resolve, reject) => {
            Fs.readFile(filepathOut, (err, data) => {
                if(err){
                    reject(err)
                }else {
                    ipfsFileUploadService.uploadBuffer(data,(progressPercent)=>{console.log("upload : "+progressPercent)}).then(value => {
                        ipfsFileUploadService.pin(value.fileId);
                        resolve(value);
                    }).catch(reason => {
                        reject(reason);
                    })
                }
            });
        });
    }

    uploadBuffer(buffer: Buffer, progress: (progressPercent: number) => void = () => {
    }, step: number = 0): Promise<UploadedDataInterface> {
        return new Promise<UploadedDataInterface>((resolveMain, rejectMain) => {
            return new Promise<UploadedDataInterface>(async (resolve, reject) => {
                if (step >= this.ipfsApis.length) {
                    reject("no more upload server available");
                    return;
                }
                progress(20);
                let ipfsApi: IpfsAPIInterface = this.ipfsApis[step];
                let ipfsId;
                let files = ipfsApi.api.add(buffer, {
                    progress: (prog) => {
                        progress(prog);
                    }
                });
                let number = 0;
                for await (const file of files) {
                    number++;
                    if(number>1){
                        throw new Error();
                    }
                    ipfsId = file.path;
                    let imageLink = this.ipfsMainGatway + ipfsId;
                    //console.log(imageLink);
                    progress(100);
                    resolve({
                        fileId: ipfsId,
                        fileURL: imageLink
                    });
                    return;
                }
            }).then(value => {
                resolveMain(value);
            }).catch(reason => {
                audit.warn("ipfs node upload failed:", reason);
                step++;
                if (step >= this.ipfsApis.length) {
                    rejectMain("no more upload server available");
                } else {
                    this.uploadBuffer(buffer, progress, step).then(value => {
                        resolveMain(value);
                    }).catch(reason2 => {
                        rejectMain(reason2);
                    });
                }
            });
        });
    }

    uploadFile(file: File, progress: (progressPercent: number) => void): Promise<UploadedDataInterface> {
        progress(10);
        return new Promise<UploadedDataInterface>((resolve, reject) => {
            let reader = new (<any>window).FileReader();
            reader.onloadend = () => {
                const buffer = Buffer.from(reader.result);
                this.uploadBuffer(buffer, progress).then(value => {
                    this.pinMulti(value.fileId);//no need to wait for this
                    resolve(value);
                }).catch(reason => {
                    reject(reason);
                });
            };
            reader.readAsArrayBuffer(file);
        })
    }

    ipfsHashExist(ipfsHash: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const httpClient = axios.create();
            httpClient.defaults.timeout = 20000;//ms
            let url = this.ipfsMainGatway + ipfsHash;
            httpClient.get(url).then(() => {
                resolve(true);
            }).catch(reason => {
                resolve(false);
            });
        })
    }

    uploadFileUrl(fileURL: string): Promise<{ fileId: string, fileURL: string }> {
        return new Promise((resolve, reject) => {
            //console.log('Requesting image..');
            request({
                url: fileURL,
                method: "get",
                encoding: null
            }, (error, response, body) => {
                if (error) {
                    audit.error('error:', error);
                    reject(error);
                } else {
                    const buffer = body;
                    this.uploadBuffer(buffer, progressPercent => {
                    }).then(value => {
                        this.pinMulti(value.fileId);//no need to wait for this
                        resolve(value);
                    }).catch(reason => {
                        reject(reason);
                    });
                }
            });
        })
    }

}

export let ipfsFileUploadService = new IPFSFileUploadService();
