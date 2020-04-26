import {properties} from "@root/properties/properties";

const {exec} = require("child_process");
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

export interface LiveData {
    user: string,
    name: string,
}

export interface LiveFormattedData extends LiveData {
    uploadURL: string,
    liveURL: string,
}

export default class LiveEngine {
    private db: any;

    constructor(jsonDbStorage: string) {
        const adapter = new FileSync(jsonDbStorage);
        this.db = low(adapter);
        this.db.defaults({lives: []}).write();
    }


    convert(liveData: LiveData): LiveFormattedData {
        return {
            ...liveData,
            uploadURL: properties.UPLOAD_URL + liveData.name,
            liveURL: properties.LIVE_URL + liveData.name + ".m3u8",
        }
    }

    async listLive(user: string, filter: string): Promise<LiveFormattedData[]> {
        let values = this.db.get("lives").value();
        values = values.filter((value: LiveData) => {
            return value.user === user && filter ? value.name.search(filter) !== -1 : true;
        });
        if (values) {
            return values.map(value => this.convert(value));
        } else {
            return [];
        }
    }

    async createLive(user: string, name: string) {
        const values = this.db.get("lives").find({name: name}).value();
        let ok = !(values && values.length != 0);
        if (ok) {
            this.db.get("lives").push({user: user, name: name}).write();
            return this.convert({user: user, name: name});
        } else {
            throw new Error("live already exist");
        }
    }

    async removeLive(user: string, name: string) {
        return this.db.get("lives").remove({user: user, name: name}).write();
    }

}