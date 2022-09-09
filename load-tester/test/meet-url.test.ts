const {test, expect} = require('@playwright/test');

test('meet-url', async ({page}) => {
    const data = {
        "url": process.env.url || "https://www.google.com",
        "quantity": Number.parseFloat(process.env.quantity || "2"),
        "waitMinute": Number.parseFloat(process.env.waitMinute ||"1")
    }
    const context = page.context();
    test.setTimeout(data.waitMinute*60*1000*4);

    let url = new URL(data.url);
    url.searchParams.append("allow_multi","true");
    await page.goto(url.toString());
    await page.context().grantPermissions(['camera', 'microphone']);

    //Start network test
    for (let i = 0; i < data.quantity-1; i++) {
        await context.newPage();
    }
    const allPages = context.pages();
    for (const page of allPages) {
        await page.goto(url.toString());
    }
    await new Promise(resolve => setTimeout(resolve,data.waitMinute*60*1000));
    console.log("finished :",data);
});