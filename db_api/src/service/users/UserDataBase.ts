import {userDB, UserDTO} from "@root/mongodb/user/UserModel";
import {UserProfileDTO} from "@root/mongodb/user/UserProfileModel";


export default class UserDataBase {

    async updateUser(accountId: string, email: string, signinURL: string, profile: UserProfileDTO) {
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
            promises.push(this.updateUserProfile(email, profile));
        }
        return Promise.all(promises);
    }


    private sanitizeUserProfile(user: any): UserProfileDTO | null {
        if(!user){
            return null;
        }
        if (user.length !== undefined) {
            if (user.length > 1) {
                console.error("user.length > 1");
            } else if (user.length === 1) {
                user = user[0];
            }
        }
        return {
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            companyName: user.companyName,
            jobTitle: user.jobTitle,
            bio: user.bio,
        };
    }

    private sanitizeUser(user: any): UserDTO | null {
        if(!user){
            return null;
        }
        if (user.length !== undefined) {
            if (user.length > 1) {
                console.error("user.length > 1");
            } else if (user.length === 1) {
                user = user[0];
            }
        }
        return {
            id: user.id.toString(),//convert user.id to string
            accountId: user.accountId,
            email: user.email,
            userId: user.userId,
            name: user.name,
            signinURL: user.signinURL,
            lastUpdate: user.lastUpdate,
            profile: this.sanitizeUserProfile(user.profile),
        };
    }

    async findUserDataByMail(mail: string): Promise<UserDTO> {
        return this.sanitizeUser(await userDB.find({email: mail}));
    }

    async findUserByMail(mail: string): Promise<String> {
        const user = this.sanitizeUser(await userDB.find({email: mail}));
        if (user) {
            return user.accountId;
        } else {
            return null;
        }
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

    async updateUserProfile(accountId: string, profile: UserProfileDTO) {
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

}
