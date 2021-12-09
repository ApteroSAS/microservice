import { properties } from "@root/properties/properties";
import UserDataBase from "@root/service/users/UserDataBase";

const express = require('express');
const axios = require('axios');

export default class UserApiService {
    public expressApp;
    public feathersApp: any = null;

    constructor(public userdb:UserDataBase) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.1.0";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.get('/get/user/:email/id', (req, res) => {
            let email = req.params.email;
            this.userdb.findUserDataByMail(email).then((user) => {
                res.json(user.userId);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });
        router.get('/get/user/:email', (req, res) => {
            let email = req.params.email;
            this.userdb.findUserDataByMail(email).then((user) => {
                res.json(user.profile);
            }).catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        });

        router.post('/update/user', (req, res) => {
            let json = req.body;
            console.log("URL received '/update/user'",json);
            let accountId = json.accountId;
            let mail = json.mail;
            let signinurl = json.signinurl;
            let name = json.name;
            let profile=json.profile;
            if(mail) {
                if(signinurl && mail){
                    const msg = " Merci d'utiliser Aptero! \n" +
                        " Afin de vous connecter, veuillez suivre le lien suivant. \n" +
                        " %link% \n" +
                        " Vous pouvez ignorer cet e-mail si vous ne souhaitez pas vous connecter:\n" +
                        " Thanks for using Aptero! \n" +
                        " To sign-in to aptero, please visit the link below. \n" +
                        " %link% \n" +
                        " If you did not make this request, please ignore this e-mail.\n";

                    const msgHtml = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n" +
                        "<html data-editor-version=\"2\" class=\"sg-campaigns\" xmlns=\"http://www.w3.org/1999/xhtml\">\n" +
                        "    <head>\n" +
                        "      <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n" +
                        "      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1\">\n" +
                        "      <!--[if !mso]><!-->\n" +
                        "      <meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\">\n" +
                        "      <!--<![endif]-->\n" +
                        "      <!--[if (gte mso 9)|(IE)]>\n" +
                        "      <xml>\n" +
                        "        <o:OfficeDocumentSettings>\n" +
                        "          <o:AllowPNG/>\n" +
                        "          <o:PixelsPerInch>96</o:PixelsPerInch>\n" +
                        "        </o:OfficeDocumentSettings>\n" +
                        "      </xml>\n" +
                        "      <![endif]-->\n" +
                        "      <!--[if (gte mso 9)|(IE)]>\n" +
                        "  <style type=\"text/css\">\n" +
                        "    body {width: 600px;margin: 0 auto;}\n" +
                        "    table {border-collapse: collapse;}\n" +
                        "    table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}\n" +
                        "    img {-ms-interpolation-mode: bicubic;}\n" +
                        "  </style>\n" +
                        "<![endif]-->\n" +
                        "    </head><body>" +
                        "<strong>Merci d'utiliser Aptero!</strong> <br/>" +
                        "Afin de vous connecter, veuillez suivre le lien suivant.<br/>" +
                        '<a href="%link%">Cliquez ici pour vous connecter</a><br/>' +
                        " Vous pouvez ignorer cet e-mail si vous ne souhaitez pas vous connecter. <br/>" +
                        "<br/><br/>" +
                        "<strong>Thanks for using Aptero!</strong> <br/>" +
                        "To sign-in to Aptero, please visit the link below.<br/>" +
                        '<a href="%link%">Click here to connect</a><br/>' +
                        " If you did not make this request, please ignore this e-mail.<br/>" +
                        "</body></html>";
                    axios.post(properties.MAIL_SERVICE+"/mail",{
                        to: mail,
                        from: "admin@aptero.co",
                        subject: "Sign-in to Aptero",
                        text: msg.replace("%link%",signinurl).replace("%link%",signinurl),
                        html: msgHtml.replace("%link%",signinurl).replace("%link%",signinurl),
                    })
                }
                this.userdb.updateUser(accountId, mail, signinurl,profile).then((user) => {
                    res.json(user);
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            }else{
                console.error("no email");
                res.status(500).json("no user id or email");
            }
        });
        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.feathersApp = expressApp;
        this.expressApp = expressApp;
        this.mountAPI();
    }

}
