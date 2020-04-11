const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

export class HashStorage {
    private db: any;

    constructor(jsonPath: string) {
        const adapter = new FileSync(jsonPath)
        this.db = low(adapter)
    }

    addHashData(hash, data) {
        this.db.set(hash, data).write();
    }

    getHashData(hash): string {
        return this.db.get(hash).value();
    }
}