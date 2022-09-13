const request = require("supertest");
const app = require("../app.ts");

describe("Test the main api path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/api/https:%2F%2Ffiles.aptero.co%2Fapi%2Fpublic%2Fdl%2FegWPiDDM?inline=true");
        expect(response.statusCode).toBe(200);
    });
});