import {userDB} from "@root/mongodb/UserModel";


export default class UserDataBase {

    constructor() {
        this.start();
    }

    start() {
    }

    async updateUser(accountId:string,email:string,signinURL:string){
        return new Promise<String>(async (resolve, reject) => {
            if(!email){
                reject("no email")
            }
            //try update accountID if both provided
            let promises = []
            if (accountId) {
                promises.push(this.updateUserId(email, accountId));
            }
            if (email) {
                promises.push(this.updateUserEmail(email, email));
            }
            if (signinURL) {
                promises.push(this.updateUserSignInURL(email, signinURL));
            }
            return Promise.all(promises);
        });
    }

    findUserByMail(mail):Promise<String>{
        return new Promise<String>((resolve, reject) => {
            userDB.find({ email: mail}).then((user:any)=>{
                resolve(user.accountId);
            }).catch(err => {
                reject(err);
            });
        });
    }

    updateEmailToAccountId(accountId:string,email:string){
        return new Promise<String>((resolve, reject) => {
            if(accountId===email){
                resolve("ok");
            }else {
                if (accountId === "" || !accountId || email === "" || !email) {
                    reject("wrong id :" + accountId + " / " + email);
                } else {
                    console.log("update : "+accountId+"/"+email)
                    userDB.updateOne({accountId: email}, {
                        accountId: accountId,
                        lastUpdate: new Date().toISOString(),
                    }, {upsert: true, setDefaultsOnInsert: true}).then(() => {
                        resolve("ok");
                    }).catch(err => {
                        reject(err);
                    });
                }
            }
        });
    }

    updateUserId(accountId:string,userId:string){
        return new Promise<String>((resolve, reject) => {
            if (accountId === "" || !accountId) {
                reject("wrong id :" + accountId);
            }else {
                userDB.updateOne({accountId: accountId}, {
                    userId: userId,
                    lastUpdate: new Date().toISOString(),
                }, {upsert: true, setDefaultsOnInsert: true}).then(() => {
                    resolve("ok");
                }).catch(err => {
                    reject(err);
                });
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