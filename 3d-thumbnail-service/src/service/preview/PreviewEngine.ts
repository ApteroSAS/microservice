import * as Path from "path";
import * as Fs from "fs";
import Axios from "axios";
import {ipfsFileUploadService} from "@root/service/preview/PrivateIPFSFileUploadService";
import {GoUploadServerUploadService} from "@root/service/preview/GoUploadServerUploadService";
import {FileHashComputer} from "@root/service/preview/FileHashComputer";
import {HashStorage} from "@root/service/preview/HashStorage";

const {exec} = require("child_process");


export default class PreviewEngine {
    private uploadServer: GoUploadServerUploadService;
    private hashComputer: FileHashComputer;
    private hashStorage:HashStorage = new HashStorage();

    constructor(private serverUrl:string,private token:string,private folder:string = ""){
        this.uploadServer = new GoUploadServerUploadService(serverUrl,token);
        this.hashComputer = new FileHashComputer();
    }

    async computeHash(url: string): Promise<string> {
        let folder=this.folder;
        if(folder===""){
            folder =  Path.resolve(__dirname, 'media');
        }

        console.log("downloading 3d file");
        //url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true';
        //https://hub.aptero.co/data/data/Pot_blanc_smooth.glb
        if (!Fs.existsSync(folder)) {
            Fs.mkdirSync(folder);
            console.log("created temp folder at: " + folder);
        }
        const folderIn = Path.resolve(folder, 'in');
        if (!Fs.existsSync(folderIn)) {
            Fs.mkdirSync(folderIn);
            console.log("created temp folder at: " + folderIn);
        }
        const folderOut = Path.resolve(folder, 'out');
        if (!Fs.existsSync(folderOut)) {
            Fs.mkdirSync(folderOut);
            console.log("created temp folder at: " + folderOut);
        }
        const filepath = Path.resolve(folderIn, "3dfile.glb");
        const filepathOut = Path.resolve(folderOut, "thumbnail.png");
        await Fs.closeSync(Fs.openSync(filepath, 'w'));
        const writer = Fs.createWriteStream(filepath);

        const response = await Axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        let file3dHash = await this.hashComputer.fromFilePath(filepath);
        return file3dHash;
    }

    async generateThumbnail(url: string): Promise<string> {
        //1) download url
        //2) generate thumbnail image
        //3) upload thumbnial image
        let folder=this.folder;
        if(folder===""){
            folder =  Path.resolve(__dirname, 'media');
        }

        console.log("downloading 3d file");
        //url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true';
        //https://hub.aptero.co/data/data/Pot_blanc_smooth.glb
        if (!Fs.existsSync(folder)) {
            Fs.mkdirSync(folder);
            console.log("created temp folder at: " + folder);
        }
        const folderIn = Path.resolve(folder, 'in');
        if (!Fs.existsSync(folderIn)) {
            Fs.mkdirSync(folderIn);
            console.log("created temp folder at: " + folderIn);
        }
        const folderOut = Path.resolve(folder, 'out');
        if (!Fs.existsSync(folderOut)) {
            Fs.mkdirSync(folderOut);
            console.log("created temp folder at: " + folderOut);
        }
        const filepath = Path.resolve(folderIn, "3dfile.glb");
        const filepathOut = Path.resolve(folderOut, "thumbnail.png");
        await Fs.closeSync(Fs.openSync(filepath, 'w'));
        const writer = Fs.createWriteStream(filepath);

        const response = await Axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log("generating thumbnail");

        //execCommand
        //registry.aptero.co/docker-blender:latest
        //docker run --rm -v C:\Workspace\ApteroVR\tmp\blend\media:/media/ docker-blender
        await new Promise((resolve, reject) => {
            //useage a 3d glb file must be present in the media folder "3dfile.glb"
            let cmd = "docker run --rm -v " + folder + "/in/:/media/in/ -v " + folder + "/out/:/media/out/ registry.aptero.co/docker-blender:latest";
            console.log(cmd);
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    console.log(`stdout: ${stdout}`);
                    //HACK the container fails but the image is generated
                    //reject(stderr);
                    //return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    reject(stderr);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                resolve(stdout);
            });
        });

        console.log("uploading file");
        let file3dHash = await this.hashComputer.fromFilePath(filepath);
        let result = await this.uploadServer.uploadLocalFile(filepathOut,file3dHash);
        this.hashStorage.addHashData(file3dHash,result.fileURL);
        return result.fileURL;
    }

    tryCache(hash:string){
        if(this.hashStorage.getHashData(hash)){
            return this.hashStorage.getHashData(hash);
        }else{
            return "NO_CACHE"
        }
    }

}