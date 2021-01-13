import { CalculateUnitCtx } from "../../../utils/calculateEngine/src/calculateEngine/baseCalculateUnit";
import { ActionData, ActionResult } from "../../../utils/components/actionResult";
import { HttpClientHelper } from "../../../utils/helper/httpClientHelper";
import BaseRequestFilterUnit from "../baseRequestFilterUnit";
import * as Joi from 'joi';

export default class GoogleRecaptchaCheck extends BaseRequestFilterUnit {

    public readonly unitID:string = "a99b8f65-0fec-4871-a195-97a7dbcbf416";
    public readonly unitName:string = "Google Recaptcha V3";

    public async calculate(ctx: CalculateUnitCtx): Promise<ActionData<boolean>> {
        const secret = ctx.instanceConfig.secret;
        const recaptchaToken = ctx.context.requestContext.query.recaptcha;

        const verifyResult = await this.verifyAPI(secret,recaptchaToken);
        if(verifyResult.succeed && verifyResult.data){
            return new ActionData(true);
        } else {
            return new ActionData(false);
        }
    }

    public async checkCtx(ctx: CalculateUnitCtx): Promise<ActionResult> {
        const configSchema = Joi.object({
            secret:Joi.string().required()
        }).required();
        const verify = configSchema.validate(ctx.instanceConfig,{allowUnknown:true});
        if(verify.error != undefined || verify.errors != undefined){
            return new ActionResult(false,undefined,"",new Error(`instanceConfig invalid`));
        }
        
        if(ctx.context.requestContext.query.recaptcha == undefined){
            return new ActionResult(false,undefined,"",new Error(`not include recaptcha token`));
        }

        return new ActionResult(true);
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