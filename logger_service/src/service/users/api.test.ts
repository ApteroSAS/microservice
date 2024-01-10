import LoggerDataBase from "@root/service/users/LoggerDataBase";
import {startMongoose, stopMongoose} from "@root/mongodb/MongooseService";
import {properties} from "@root/properties/properties";

let userDataBase: LoggerDataBase;
beforeAll(async () => {
    properties.CLEANUP_CRON = "DISABLED";
    // Start Mongoose
    await startMongoose();

    // Initialize UserDataBase and assign it to the variable
    userDataBase = new LoggerDataBase();
});

afterAll(async () => {
    // Close the Mongoose connection
    await stopMongoose();
});

test('trace-test', async () => {
    //add a test call 2 years ago so it is clean up in the next clean up
    let date = new Date();
    date.setFullYear(date.getFullYear() - 2);
    await userDataBase.trace({test: "test", time: date.toISOString()});
});

test('cleanUp-test', async () => {
    //call clean up
    await userDataBase.cleanUp();
});
