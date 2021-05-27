import {applyKMeansConstrained} from "@root/unliEngine/KmeansConstrained";
import {v4 as uuidv4} from 'uuid';

/*
event
create room
delete room
user move to room (id)
user deleted
 */

export interface Point {
    x:number,y:number,z:number
}

export interface ClientPoint extends Point{
    group:number,
    groupName:string
}

export class UnliEngineRoom {
    //Create subroom
    //compute user alocation and send connection event
    //create bridge between room
    //https://github.com/mcserep/NetOctree
    private computeInProgress: boolean;

    constructor(private roomid:string,private maxRadius:number) {
        //maxRadius<=0 means infinite
        // if inifnie use NxN room connexion
        // if not use 1-1 connexion for everyone in radius
    }

    points : { [id: string] : ClientPoint } = {};
    foreignConnexion : { [id: string] : boolean } = {};

    computeGroupCenter(points):{points:{ [id: string] : ClientPoint },center:Point}{
        let groups:{points?:{ [id: string] : ClientPoint },center?:Point} = {};
        Object.keys(points).forEach(key => {
            let point = points[key];
            if(!groups[point.group]){
                groups[point.group]={points:{}};
            }
            groups[point.group].points[key] = point;
        });
        Object.keys(groups).forEach(gkey => {
            let group = groups[gkey];
            group.center = {x:0,y:0,z:0};
            Object.keys(group.points).forEach(key => {
                group.center.x += group.points[key].x;
                group.center.y += group.points[key].y;
                group.center.z += group.points[key].z;
            });
            let groupNb = Object.keys(group.points).length;
            group.center.x /= groupNb;
            group.center.y /= groupNb;
            group.center.z /= groupNb;
        })
        return groups as {points:{ [id: string] : ClientPoint },center:Point};
    }

    distance(pointA:Point,pointB:Point){
        return Math.sqrt(Math.pow(pointA.x-pointB.x,2)+Math.pow(pointA.y-pointB.y,2)+Math.pow(pointA.z-pointB.z,2));
    }

    computeGroup(newpoints: { [id: string] : ClientPoint }):{toAdd:string[],toRemove:string[]}{
        let oldGroupCenter:{points:{ [id: string] : ClientPoint },center:Point} = this.computeGroupCenter(this.points);
        let newGroupCenter:{points:{ [id: string] : ClientPoint },center:Point} = this.computeGroupCenter(newpoints);
        let newGroupToName={};
        let oldGroupToName={};
        let initialNewGroupCenterKey = Object.keys(newGroupCenter);

        //find each closest group in the new group center
        Object.keys(oldGroupCenter).forEach(oldGroupKey => {
            if(oldGroupKey === "default"){
                return;
            }
            let groupA = oldGroupCenter[oldGroupKey].center;
            let oldPoints = oldGroupCenter[oldGroupKey].points;
            let groupName = oldPoints[Object.keys(oldPoints)[0]].groupName;
            oldGroupToName[oldGroupKey]=groupName;
            let minDist = Number.MAX_VALUE;
            let minKey = undefined;
            Object.keys(newGroupCenter).forEach(newGroupKey => {
                let groupB = newGroupCenter[newGroupKey].center;
                let distance = Math.pow(groupA.x-groupB.x,2)+Math.pow(groupA.y-groupB.y,2)+Math.pow(groupA.z-groupB.z,2);
                if(distance<minDist){
                    minDist = distance;
                    minKey= newGroupKey;
                }
            })
            if(!minKey){
                return; //initialisation
            }
            //apply old groups to new ones
            newGroupToName[minKey]=groupName;
            delete newGroupCenter[minKey];
        })

        //create new room
        initialNewGroupCenterKey.forEach(newGroupKey => {
            if(!newGroupToName[newGroupKey] || newGroupToName[newGroupKey]==="default"){
                newGroupToName[newGroupKey] = uuidv4();
            }
        });

        //compute groupe created and removed
        let oldGroupName:string[] = Object.values(oldGroupToName);
        let newGroupName:string[] = Object.values(newGroupToName);
        let toAdd = newGroupName.filter(x => !oldGroupName.includes(x));
        let toRemove = oldGroupName.filter(x => !newGroupName.includes(x));
        toAdd.forEach(value => {
            console.log("room created "+value);
        })
        toRemove.forEach(value => {
            console.log("room deleted "+value);
        })

        //apply group name in point
        Object.keys(newpoints).forEach(key => {
            let point = newpoints[key];
            point.groupName = newGroupName[point.group];
        });
        return {toAdd,toRemove}
    }


    async compute():Promise<{roomCreated,roomDeleted,clientRoomChanged,foreignCreated,foreignRemoved,points,foreign}>{
        if(this.computeInProgress){
            let ret = {
                clientRoomChanged:[],
                roomCreated:[],
                roomDeleted:[],
                foreignCreated:{},
                foreignRemoved:{},
                points:this.points,
                foreign:this.foreignConnexion
            }
            return ret;
        }
        this.computeInProgress = true
        let start = performance.now();
        ///compute k means
        let data = await applyKMeansConstrained(this.points,2,40,10);
        let newpoints = data.points;
        let rooms = this.computeGroup(newpoints);
        let clientRoomChanged = this.computeAndUpdateClientRooms(newpoints);
        let newForeign = this.computeForeignConnexion();
        //TODO compare and update
        this.foreignConnexion = newForeign;
        //console.log(newpoints);
        // TODO compare points and emit event for room create delete etc...
        // TODO compute foreign connexion based on client max dist
        // TODO webrtc bridge ability to connect client (spatialized) to client and room to room (non spacialized)
        // TODO compute delta foreign connexion and send event
        // TODO create a websocket to listen to the event (maybe create a proxy for websocket)
        // TODO create an adapter that listen to the event

        let stop = performance.now();
        console.log("Call to doSomething took " + (stop - start) + " milliseconds.")
        let ret = {
            clientRoomChanged,
            roomCreated:rooms.toAdd,
            roomDeleted:rooms.toRemove,
            foreignCreated:{},
            foreignRemoved:{},
            points:this.points,
            foreign:this.foreignConnexion
        }
        this.computeInProgress = false;
        return ret;
    }

    computeAndUpdateClientRooms(newpoints){
        let updated = {};
        Object.keys(newpoints).forEach(key => {
            if(!this.points[key]){
                throw new Error();
            }
            if(this.points[key].groupName !== newpoints[key].groupName){
                updated[key]=newpoints[key].groupName;
            }
        });
        //update client movement
        this.points = newpoints;
        return updated;
    }

    computeForeignConnexion(){
        let foreignCo = {};
        if(this.maxRadius>0) {
            Object.keys(this.points).forEach(keyA => {
                Object.keys(this.points).forEach(keyB => {
                    if ((keyA !== keyB) && (this.points[keyA].groupName !== this.points[keyB].groupName)) {
                        if (this.distance(this.points[keyA], this.points[keyB]) > this.maxRadius) {
                            //console.log("create 1x1 connexion between "+keyA+"/"+keyB)
                            foreignCo[keyA + "/" +keyB] = true;
                            foreignCo[keyB + "/" +keyA] = true;
                        }
                    }
                });
            });
        }else{
            console.log("create NxN connexion between rooms")
            throw new Error("unsuported yet")
        }
        return foreignCo;
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
        return true;
    }

    addPoint(id:string,x:number,y:number,z:number){
        this.points[id]={x,y,z,group:0,groupName:"default"};
    }

    updatePoint(id:string,x:number,y:number,z:number){
        this.points[id].x=x;
        this.points[id].y=y;
        this.points[id].z=z;
    }

    removePoint(id:string,x:number,y:number,z:number){
        delete this.points[id];
    }

    getClients() {
        return this.points;
    }
}