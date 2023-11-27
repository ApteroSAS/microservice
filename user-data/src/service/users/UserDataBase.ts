import {userDB} from "@root/mongodb/UserModel";


export default class UserDataBase {

    async updateUser(accountId: string, email: string, signinURL: string, profile: string) {
        if (!email) {
            throw new Error("no email")
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
        if (profile) {
            console.log("profile : ", profile);
            promises.push(this.updateUserProfile(email, profile));
        }
        return Promise.all(promises);
    }

    async findUserDataByMail(mail): Promise<any> {
        const user = await userDB.find({email: mail});
        if (user.length === 1) {
            user[0].id = user[0].id.toString();//convert user.id to string
            return user[0];
        } else {
            //user not found
            return null;
        }
    }

    async findUserByMail(mail): Promise<String> {
        const user: any = await userDB.find({email: mail});
        user.id = user.id.toString();//convert user.id to string
        return (user.accountId);//TODO is this realy working????
    }

    async updateEmailToAccountId(accountId: string, email: string) {
        if (accountId === email) {
            return "ok";
        }
        if (accountId === "" || !accountId || email === "" || !email) {
            throw new Error("wrong id :" + accountId + " / " + email);
        }
        console.log("update : " + accountId + "/" + email)
        await userDB.updateOne({accountId: email}, {
            accountId: accountId,
            lastUpdate: new Date().toISOString(),
        }, {upsert: true, setDefaultsOnInsert: true});
        return "ok";
    }

    async updateUserId(accountId: string, userId: string) {
        if (accountId === "" || !accountId) {
            throw new Error("wrong id :" + accountId);
        }
        await userDB.updateOne({accountId: accountId}, {
            userId: userId,
            lastUpdate: new Date().toISOString(),
        }, {upsert: true, setDefaultsOnInsert: true});
    }

    async updateUserEmail(accountId: string, email: string) {
        if (accountId === "" || !accountId) {
            throw new Error("wrong id :" + accountId);
        }
        await userDB.updateOne({accountId: accountId}, {
            email: email,
            lastUpdate: new Date().toISOString(),
        }, {upsert: true, setDefaultsOnInsert: true});
        return "ok";
    }

    async updateUserProfile(accountId: string, profile: string) {
        if (accountId === "" || !accountId) {
            throw new Error("wrong id :" + accountId);
        }
        await userDB.updateOne({accountId: accountId}, {
            profile: profile,
            lastUpdate: new Date().toISOString(),
        }, {upsert: true, setDefaultsOnInsert: true});
        return "ok";
    }

    async updateUserSignInURL(accountId: string, signinURL: string) {
        if (accountId === "" || !accountId) {
            throw new Error("wrong id :" + accountId);
        }
        await userDB.updateOne({accountId: accountId}, {
            signinURL: signinURL,
            lastUpdate: new Date().toISOString(),
        }, {upsert: true, setDefaultsOnInsert: true});
        return "ok";
    }


    async setModeratorMultiple(emails: string[], roomSIDs: string[]):Promise<void> {
        for (let email of emails) {
            for (let roomSID of roomSIDs) {
                await this.setModerator(email, roomSID);
            }
        }
    }

    async setModerator(email: string, roomSID: string):Promise<void> {
        //TODO
    }
}
