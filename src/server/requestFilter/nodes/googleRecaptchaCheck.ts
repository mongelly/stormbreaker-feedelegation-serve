import Router from "koa-router";
import { ActionData } from "../../../utils/components/actionResult";
import { HttpClientHelper } from "../../../utils/helper/httpClientHelper";
import BaseRequestFilterNode from "../baseRequestFilterNode";

export class GoogleRecaptchaCheck extends BaseRequestFilterNode{
    
    public readonly nodeID:string = "a99b8f65-0fec-4871-a195-97a7dbcbf416";
    public readonly nodeName:string = "Google Recaptcha V3";

    public async calculate(): Promise<boolean> {
        let config = this.instanceConfig?.configs.filter(config => { return config.instanceid == this.instanceid; })[0];
        if(config == undefined){
            throw new Error(`can't found instanceid: ${this.instanceid} instance config`);
        }

        let recaptchaConfig = config.config as GoogleRecaptchaConfig;
        let secret = recaptchaConfig.secret;
        let recaptchaToken = this.context.recaptcha;

        if(secret == undefined || secret.length == 0){
            throw new Error(`can't found config.secret`);
        }

        if(recaptchaToken == undefined || recaptchaToken.length == 0){
            throw new Error(`can't load token from response`);
        }

        let verifyResult = await this.verifyAPI(secret,recaptchaToken);
        if(verifyResult.succeed && verifyResult.data){
            return true;
        }
        return false;
    }

    private async verifyAPI(secret:string,recaptchaToken:string):Promise<ActionData<boolean>>{
        let result = new ActionData<boolean>();
        let apiUrl = "https://www.recaptcha.net/recaptcha/api/siteverify";
        let httpClient = new HttpClientHelper();
        let parames:any = {
            secret:secret,
            response:recaptchaToken
        }

        try {
            let httpResult = await httpClient.request(apiUrl,"POST",parames,undefined,undefined);
            if(httpResult.succeed){
                if(httpResult.data != undefined){
                    result.data = httpResult.data.body["success"] as boolean;
                    result.succeed = true;
                }
            } else {
                result.copyBase(result);
            }
        } catch (error) {
            result.error = error
            result.succeed = false;
        }

        return result;
    }
}

interface GoogleRecaptchaConfig{
    secret:string;
}

export default new GoogleRecaptchaCheck();