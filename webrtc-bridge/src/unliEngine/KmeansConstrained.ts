import {PythonShell} from "python-shell";

export async function applyKMeansConstrained(points,min,max,target):Promise<{points:any,groupNb:number}>{
    return new Promise((resolve,reject) => {
        let myPythonScriptPath = 'KMeansConstrained.py';
        let pyshell = new PythonShell(myPythonScriptPath);
        let keys = Object.keys(points);
        if(keys.length==0){
            resolve({points: {}, groupNb:0})
            return;
        }
        let raw = keys.map(key=>{
            let t = points[key];
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
                let maxGroup = 0;
                for (let i = 0; i < res.length; i++) {
                    if(maxGroup<res[i]){
                        maxGroup = res[i];
                    }
                    newPoint[keys[i]] = {
                        ...points[keys[i]],
                        group: res[i]
                    };
                }
                resolve({points:newPoint, groupNb:maxGroup});
            }
        });
        pyshell.send(JSON.stringify({min:min,max:max,target:target}));
        pyshell.send(JSON.stringify(raw));
        pyshell.end((err) =>{
            if (err){
                reject(err);
            }
        });
    })
}