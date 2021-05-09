
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
                let newPoint = {};
                let res = JSON.parse(message)
                for (let i = 0; i < res.length; i++) {
                    newPoint[keys[i]] = {
                        ...points[keys[i]],
                        groupe : res[i]
                    };
                }
                resolve(newPoint);
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

    async compute(){
        this.addPoint("1",1,1,1);
        this.addPoint("2",2,10,1);
        this.addPoint("4",2,10,2);
        this.addPoint("5",2,10,3);
        this.addPoint("6",2,1,10);
        this.addPoint("7",2,2,10);
        let newpoints = await this.applyKMeansConstrained(this.points,2,40);
        console.log(newpoints);
        //TODO compare points and emit event for room create delete etc...
        //TODO generate random point
        // TODO create a simple page for visualazing points
        // TODO compute foreign connexion based on client max dist
        //TODO webrtc bridge ability to connect client (spatialized) to client and room to room (non spacialized)
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

}