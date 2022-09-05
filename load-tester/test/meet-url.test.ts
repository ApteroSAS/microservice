const {test, expect} = require('@playwright/test');

test('meet-url', async ({page}) => {
    const data = {
        "url": process.env.url || "https://www.google.com",
        "quantity": Number.parseFloat(process.env.quantity || "2"),
        "waitMinute": Number.parseFloat(process.env.waitMinute ||"1")
    }
    const context = page.context();
    test.setTimeout(data.waitMinute*60*1000*4);

    await page.goto(data.url);
    await page.context().grantPermissions(['camera', 'microphone']);

    // Click text=MoreMore
    await page.locator('text=MoreMore').click();
    // Click text=SettingsPreferences
    await page.locator('text=SettingsPreferences').click();
    // Click text=Misc
    await page.locator('text=Misc').click();
    await (await (await (await page.locator('text=Disable auto-exit when multiple hubs instances are open')).locator('xpath=..')).locator("input")).click();
    await (await (await (await page.locator('text=Disable auto-exit when idle or backgrounded')).locator('xpath=..')).locator("input")).click();
    //await page.locator('div:nth-child(10) .preferences-screen__row__24y1Q input').click();
    //await page.locator('div:nth-child(11) .preferences-screen__row__24y1Q input').check();
    // Click [aria-label="Close Preferences Menu"]
    await page.locator('[aria-label="Close Preferences Menu"]').click();

    //Start network test
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