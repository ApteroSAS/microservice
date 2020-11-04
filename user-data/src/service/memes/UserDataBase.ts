import {userDB} from "@root/mongodb/UserModel";


export default class UserDataBase {

    constructor() {
        this.start();
    }

    start() {
    }

    updateUser(accountId:string,email:string,userName:string){
        return new Promise<String>((resolve, reject) => {
            if (accountId === "" || !accountId) {
                reject("wrong id :" + accountId);
                return;
            }
            if(email !== email){
                reject("wrong email :" + email);
                return;
            }
            //TODO create or update
            userDB.update({accountId: accountId}, {
                accountId:accountId,
                email:email,
                name:userName,
            }, {upsert: true,setDefaultsOnInsert: true}).then(() => {
                resolve("ok");
            }).catch(err=>{
                reject(err);
            });
        });
    }


}