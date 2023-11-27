import UserDataBase from "@root/service/users/UserDataBase";
import {startMongoose, stopMongoose} from "@root/mongodb/MongooseService";

let userDataBase: UserDataBase;
beforeAll(async () => {
    // Start Mongoose
    await startMongoose();

    // Initialize UserDataBase and assign it to the variable
    userDataBase = new UserDataBase();
});

afterAll(async () => {
    // Close the Mongoose connection
    await stopMongoose();
});

test('findUserByMail', async () => {
    let data = await userDataBase.findUserByMail("test@aptero.co");
    console.log(data);
    expect(data).not.toBeNull();
});

test('findUserDataByMail', async () => {
    let data = await userDataBase.findUserDataByMail("test@aptero.co");
    console.log(data);
    expect(data).not.toBeNull();
});

test('updateEmailToAccountId', async () => {
    /*let data = await userDataBase.findUserDataByMail("test@aptero.co");
    expect(data).not.toBeNull();
    let data2 = await userDataBase.updateEmailToAccountId(data.accountId,"test2@aptero.co");
    expect(data2).not.toBeNull();
    let data3 = await userDataBase.findUserDataByMail("test2@aptero.co");
    expect(data3).not.toBeNull();
    let data4 = await userDataBase.updateEmailToAccountId(data.accountId,"test@aptero.co");
    expect(data4).not.toBeNull();*/
});

test('updateUser', async () => {
    let data = await userDataBase.findUserDataByMail("test@aptero.co");
    expect(data).not.toBeNull();
    //random string
    const random = Math.random().toString(36).substring(7);
    let data2 = await userDataBase.updateUser(data.accountId,"test@aptero.co","https://aptero.co"+random,{
        displayName:"test"+random,
        phoneNumber:"123456789"+random,
        companyName:"aptero"+random,
        jobTitle:"dev"+random,
        bio:"test bio"+random,
    });
    expect(data2).not.toBeNull();
    let data3 = await userDataBase.findUserDataByMail("test@aptero.co");
    console.log(data3);
    expect(data3).toEqual(expect.objectContaining({
        email: "test@aptero.co",
        signinURL: "https://aptero.co"+random,
        profile: expect.objectContaining({
            displayName: "test"+random,
            phoneNumber: "123456789"+random,
            companyName: "aptero"+random,
            jobTitle: "dev"+random,
            bio: "test bio"+random,
        })
    }));
});
