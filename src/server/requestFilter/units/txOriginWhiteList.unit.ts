import { CalculateUnitCtx } from "../../../utils/calculateEngine/src/calculateEngine/baseCalculateUnit";
import { ActionData, ActionResult } from "../../../utils/calculateEngine/src/utils/components/actionResult";
import BaseRequestFilterUnit from "../baseRequestFilterUnit";
import Joi from "joi";

export default class TxOriginWhiteList extends BaseRequestFilterUnit {

    public readonly nodeID:string = "8052e3c7-0a00-4047-a53e-a27841db5dd7";
    public readonly nodeName:string = "Tx origin whitelist";

    public async calculate(ctx: CalculateUnitCtx): Promise<ActionData<boolean>> {
        const config = ctx.instanceConfig as Array<string>;
        if(config.find(address => {return address.toLocaleLowerCase() == ctx.context.origin.toLocaleLowerCase()}) != undefined){
            return new ActionData(true);
        }
        return new ActionData(false);
    }

    public async checkCtx(ctx: CalculateUnitCtx): Promise<ActionResult> {
        const configSchema = Joi.array().items(Joi.string().lowercase().length(42).regex(/^(-0x|0x)[0-9a-f]*$/).required()).required();
        const verify = configSchema.validate(ctx.instanceConfig,{allowUnknown:true});
        if(verify.error != undefined || verify.errors != undefined){
            return new ActionResult(false,undefined,"",new Error(`instanceConfig invalid`));
        }
        return new ActionResult(true);
    }

}