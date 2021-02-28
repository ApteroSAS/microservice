import { properties } from "@root/properties/properties"

export default class MailService {

    sendMail(msg:{
            to: string,
            from: string,
            subject: string,
            text: string,
            html: string,
        }){
        // using Twilio SendGrid's v3 Node.js Library
        // https://github.com/sendgrid/sendgrid-nodejs
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(properties.SENDGRID_API_KEY);
        return sgMail.send(msg);
    }

}