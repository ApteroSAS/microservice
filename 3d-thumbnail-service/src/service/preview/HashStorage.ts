export class HashStorage{
    hashData={};

    constructor(){

    }

    addHashData(hash,data){
        this.hashData[hash]=data;
    }

    getHashData(hash){
        return this.hashData[hash];
    }
}