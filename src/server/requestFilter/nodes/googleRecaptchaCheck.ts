import Router from "koa-router";
import { ActionResultWithData } from "../../../framework/components/actionResult";
import { HttpClientHelper } from "../../../framework/helper/httpClientHelper";
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
        let responseToken = (this.context.ctx as Router.IRouterContext).response.headers["token"];

        if(secret == undefined || secret.length == 0){
            throw new Error(`can't found config.secret`);
        }

        if(responseToken == undefined || responseToken.length == 0){
            throw new Error(`can't load token from response`);
        }

        // let verifyResult = await this.verifyAPI(secret,responseToken);
        // if(verifyResult.Result){
        //     return verifyResult.Data!;
        // } else {
        //     return false;
        // }

        return true
    }

    private async verifyAPI(secret:string,responseToken:string):Promise<ActionResultWithData<boolean>>{
        let result = new ActionResultWithData<boolean>();
        let apiUrl = "https://www.google.com/recaptcha/api/siteverify";
        let httpClient = new HttpClientHelper(apiUrl);
        let body:any = {
            secret:secret,
            response:responseToken
        }

        let httpResult = await httpClient.doRequest("POST",undefined,undefined,body);
        if(httpResult.Result){
            if(httpResult.Data != undefined){
                result.Data = httpResult.Data["success"] as boolean;
                result.Result = true;
            }
        } else {
            result.copyBase(result);
        }

        return result;
    }
}

interface GoogleRecaptchaConfig{
    secret:string;
}

export default new GoogleRecaptchaCheck();