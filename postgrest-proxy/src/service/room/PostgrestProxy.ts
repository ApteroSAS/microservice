import {JWTAuth} from "@root/jwt/JWTAuth";
import PostgrestController from "@root/postgrest/PostgrestController";

const express = require('express');

export default class PostgrestProxy {
    public expressApp;

    constructor(private postgrestController:PostgrestController,private jwt:JWTAuth) {
    }

    mountAPI() {
        this.expressApp.use(async (req, res, next) => {
            if(req.headers.authorization){
                let auth = req.headers.authorization.replace("Bearer ","");
                let payload = await this.jwt.verifyAndDecode(auth,{issuer:"ret"});
                let account = payload.sub;
                //let accountData:any = (await this.postgrestController.get({},"/accounts?account_id=eq."+account)).data;
                let accountData:any = (await this.postgrestController.get({},"/accounts?id=eq."+account)).data;
                let headers = {
                    "Content-Type": "application/json",
                };
                if(req.headers["Accept"]){
                    headers["Accept"]=req.headers["Accept"];
                }
                if(req.headers["Prefer"]){
                    headers["Prefer"]=req.headers["Prefer"];
                }
                if(req.headers["Range-Unit"]){
                    headers["Range-Unit"]=req.headers["Range-Unit"];
                }
                delete headers["host"];
                if(accountData.length==1 && accountData[0]["is_admin"]) {
                    let promise
                    switch (req.method) {
                        case "GET":
                            promise = this.postgrestController.get(headers,req.url);
                            break;
                        case "POST":
                            promise = this.postgrestController.post(headers,req.url, req.body);
                            break;
                        case "PUT":
                            promise = this.postgrestController.put(headers,req.url, req.body);
                            break;
                        case "PATCH":
                            promise = this.postgrestController.patch(headers,req.url, req.body);
                            break;
                        case "DELETE":
                            promise = this.postgrestController.delete(headers,req.url);
                            break;
                        default:
                            promise = new Promise((resolve, reject) => resolve({}));
                            next(); // Passing the request to the next handler in the stack.
                        //res.status(500).json("invalid method");
                    }
                    promise.then((data) => {
                        res.setHeader("content-range",data.headers["content-range"])

                        res.json(data.data);
                    }).catch(err => {
                        console.error(err);
                        res.status(500).json(err);
                    });
                }else{
                    res.json('invalid admin user');
                }
            }else{
                res.json('invalid jwt');
            }
        });
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}