
import {PythonShell} from 'python-shell';

export default class UnliEngine {
    //Create subroom
    //compute user alocation and send connection event
    //create bridge between room
    //https://github.com/mcserep/NetOctree

    points = {};

    async applyKMeansConstrained(points,min,max){
        return new Promise((resolve,reject) => {
            let myPythonScriptPath = 'KMeansConstrained.py';
            let pyshell = new PythonShell(myPythonScriptPath);
            let keys = Object.keys(this.points);
            let raw = keys.map(key=>{
                let t = this.points[key];
                return [t.x,t.y,t.z];
            });
            pyshell.on('stderr', (stderr) => {
                console.error(stderr)
                // handle stderr (a line of text from stderr)
            });
            pyshell.on('message', (message) => {
                if(message.startsWith("log:")){
                    console.log(message);
                }else {
                    let newPoint = {};
                    let res = JSON.parse(message)
                    for (let i = 0; i < res.length; i++) {
                        newPoint[keys[i]] = {
                            ...points[keys[i]],
                            groupe: res[i]
                        };
                    }
                    resolve(newPoint);
                }
            });
            pyshell.send(JSON.stringify({min:min,max:max}));
            pyshell.send(JSON.stringify(raw));
            pyshell.end((err) =>{
                if (err){
                    reject(err);
                }
            });
        })
    }

    generateFake(boxSz = 250,center = {x:0,y:0,z:0},numSpheres = 300){
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
        }
        for (var i = 0; i < numSpheres; i++) {
            let x = getRandomInt(-boxSz, boxSz) + center.x;
            let y = getRandomInt(-boxSz, boxSz) + center.y;
            let z = getRandomInt(-boxSz, boxSz) + center.z;
            this.addPoint("client"+JSON.stringify(center)+i,x,y,z);
        }
    }

    async compute(){
        this.generateFake(60,{x:0,y:0,z:0},10);
        this.generateFake(60,{x:100,y:100,z:100},200);
        this.generateFake(60,{x:300,y:300,z:300},5);
        this.generateFake(60,{x:0,y:300,z:300},5);
        this.generateFake(60,{x:0,y:0,z:300},5);
        let newpoints = await this.applyKMeansConstrained(this.points,2,40);
        this.points = newpoints;
        console.log(newpoints);
        // TODO compare points and emit event for room create delete etc...
        // TODO compute foreign connexion based on client max dist
        // TODO webrtc bridge ability to connect client (spatialized) to client and room to room (non spacialized)
        // TODO compute delta foreign connexion and send event
        // TODO create a websocket to listen to the event (maybe create a proxy for websocket)
        // TODO create an adapter that listen to the event
    }

    addPoint(id:string,x:number,y:number,z:number){
        this.points[id]={x,y,z};
    }

    updatePoint(id:string,x:number,y:number,z:number){
        this.points[id]={x,y,z};
    }

    removePoint(id:string,x:number,y:number,z:number){
        delete this.points[id];
    }

    computeSpaceChanges(){
        //return new octree Structure?
        //or return event to apply?
        //ultimately we whant the event to create an remove the room
    }

    getClients() {
        return this.points;
    }
}