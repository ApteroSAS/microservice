const {test, expect} = require('@playwright/test');

test('simple-url', async ({page}) => {
    const data = {
        "url": process.env.url || "https://www.google.com",
        "quantity": Number.parseFloat(process.env.quantity || "2"),
        "waitMinute": Number.parseFloat(process.env.waitMinute ||"1")
    }
    console.log(data);
    for (let i = 0; i < data.quantity; i++) {
        await page.goto(data.url);
    }
    //Start network test
    test.setTimeout(data.waitMinute*60*1000*4);
    const context = page.context();
    for (let i = 0; i < data.quantity-1; i++) {
        await context.newPage();
    }
    const allPages = context.pages();
    for (const page of allPages) {
        await page.goto(data.url);
    }
    await new Promise(resolve => setTimeout(resolve,data.waitMinute*60*1000));
    console.log("finished :",data);
});