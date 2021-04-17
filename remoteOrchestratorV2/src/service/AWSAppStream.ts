import {properties} from "@root/properties/properties";

const {exec} = require("child_process");

export class AWSAppStream {

    /*
    NAME
    create-streaming-url -

    DESCRIPTION
           Creates a temporary URL to start an AppStream 2.0 streaming session for
           the specified user. A streaming URL enables application streaming to be
           tested without user setup.

           See also: AWS API Documentation

           See 'aws help' for descriptions of global parameters.

    SYNOPSIS
                create-streaming-url
              --stack-name <value>
              --fleet-name <value>
              --user-id <value>
              [--application-id <value>]
              [--validity <value>]
              [--session-context <value>]
              [--cli-input-json | --cli-input-yaml]
              [--generate-cli-skeleton <value>]
     */
    async getStreamingURL(data: { stackName:string, fleetName: string,userId:string,applicationId:string,sessionContext:string }){
        let path = properties.AWS_CRED_PATH;
        if(!data.stackName){
            data.stackName = properties.DEFAULT_STACK_NAME;
        }
        if(!data.fleetName){
            data.fleetName = properties.DEFAULT_FLEET_NAME;
        }
        if(!data.applicationId){
            data.applicationId = properties.DEFAULT_APP_ID;
        }
        return new Promise<string>((resolve, reject) => {
            //https://docs.aws.amazon.com/cli/latest/userguide/aws-cli.pdf
            // docker run --rm -it --mount src="%cd%\aws_cred",target=/root/.aws/,type=bind amazon/aws-cli appstream describe-fleets
            //https://docs.aws.amazon.com/appstream2/latest/APIReference/API_CreateStreamingURL.html
            //docker run --rm -it --mount src="%cd%\aws_cred",target=/root/.aws/,type=bind amazon/aws-cli appstream create-streaming-url --stack-name FallBackStack --fleet-name FallBackFleet --user-id username --application-id chrome-context --session-context \"meet.aptero.co\"
            let cmd = "docker run --rm --mount src=\""+path+"\",target=/root/.aws/,type=bind amazon/aws-cli appstream create-streaming-url " +
                "--stack-name "+data.stackName+" " +
                "--fleet-name "+data.fleetName+" " +
                "--user-id "+data.userId+" " +
                "--application-id "+data.applicationId+" " +
                "--session-context \""+data.sessionContext+"\"";
            console.log(cmd);
            exec(cmd,(error, stdout, stderr) => {
                if(error || stderr || !stdout){
                    console.error(error);
                    console.error(stderr);
                    console.log(stdout);
                    reject(stderr);
                }else {
                    let result = JSON.parse(stdout);
                    let data = result.StreamingURL;
                    result.StreamingURLBase64 = new Buffer(data).toString('base64');
                    console.log(result);
                    resolve(result);
                }
            });
        })
    }
}