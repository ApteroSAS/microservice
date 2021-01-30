import {userDB} from "@root/mongodb/UserModel";


export default class UserDataBase {

    constructor() {
        this.start();
    }

    start() {
    }

    updateUser(accountId:string,email:string,signinURL:string){
        return new Promise<String>((resolve, reject) => {
            if (accountId === "" || !accountId) {
                reject("wrong id :" + accountId);
            }else {
                let promises = []
                if (email) {
                    promises.push(this.updateUserEmail(accountId, email));
                }
                if (signinURL) {
                    promises.push(this.updateUserSignInURL(accountId, signinURL));
                }
                return Promise.all(promises);
            }
        });
    }

    updateUserEmail(accountId:string,email:string){
        return new Promise<String>((resolve, reject) => {
            if (accountId === "" || !accountId) {
                reject("wrong id :" + accountId);
            }else {
                userDB.updateOne({accountId: accountId}, {
                    email: email,
                    lastUpdate: new Date().toISOString(),
                }, {upsert: true, setDefaultsOnInsert: true}).then(() => {
                    resolve("ok");
                }).catch(err => {
                    reject(err);
                });
            }
        });
    }


    updateUserSignInURL(accountId:string,signinURL:string){
        return new Promise<String>((resolve, reject) => {
            if (accountId === "" || !accountId) {
                reject("wrong id :" + accountId);
            }else {
                userDB.updateOne({accountId: accountId}, {
                    signinURL: signinURL,
                    lastUpdate: new Date().toISOString(),
                }, {upsert: true, setDefaultsOnInsert: true}).then(() => {
                    resolve("ok");
                }).catch(err => {
                    reject(err);
                });
            }
        });
    }

}