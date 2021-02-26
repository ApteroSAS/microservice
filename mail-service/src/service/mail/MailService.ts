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
        /*const msg = {
        to: 'admin@aptero.co', // Change to your recipient
        from: 'admin@aptero.co', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        }*/
        return sgMail.send(msg);
    }

}