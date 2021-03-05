import { CalculateUnitCtx } from "../../../utils/calculateEngine/src/calculateEngine/baseCalculateUnit";
import { ActionData, ActionResult } from "../../../utils/calculateEngine/src/utils/components/actionResult";
import BaseRequestValidationUnit from "../baseRequestValidationUnit";
import Joi from "joi";

export default class TxOriginWhiteList extends BaseRequestValidationUnit {
    
    public readonly unitID:string = "8052e3c7-0a00-4047-a53e-a27841db5dd7";
    public readonly unitName:string = "Tx origin whitelist";

    public async calculate(ctx: CalculateUnitCtx): Promise<ActionData<boolean>> {
        const config = ctx.instanceConfig as Array<string>;
        if(config.find(address => {return address.toLocaleLowerCase() == ctx.context.origin.toLocaleLowerCase()}) != undefined){
            return new ActionData(true);
        }
        return new ActionData(false);
    }

    public async checkCtx(ctx: CalculateUnitCtx): Promise<ActionResult> {
        return await this.checkInstanceConfig(ctx);
    }

    public async checkInstanceConfig(instanceConfig: any): Promise<ActionResult> {
        if(instanceConfig == undefined){
            return new ActionResult(new Error(`instanceConfig undefined`));
        }

        const configSchema = Joi.array().items(Joi.string().lowercase().length(42).regex(/^(-0x|0x)[0-9a-f]*$/).required()).required();
        const verify = configSchema.validate(instanceConfig,{allowUnknown:true});
        if(verify.error != undefined || verify.errors != undefined){
            return new ActionResult(new Error(`instanceConfig invalid`));
        }
        return new ActionResult(true);
    }
}