import { Transaction } from "thor-devkit";
import { CalculateUnitCtx } from "../../../utils/calculateEngine/src/calculateEngine/baseCalculateUnit";
import BaseRequestFilterUnit from "../baseRequestFilterUnit";
import * as Joi from 'joi';
import { ActionData, ActionResult } from "../../../utils/components/actionResult";

export default class GasLimit extends BaseRequestFilterUnit{
    
    public readonly unitID:string = "a6e7c2a0-e7a0-4b7c-926a-03e1c9c0acd0";
    public readonly unitName:string = "Gas Limit";

    
    public async calculate(ctx: CalculateUnitCtx): Promise<ActionData<boolean>> {
        const gasLimit = ctx.instanceConfig["gas_limit"] as number;
        const txBody = ctx.context.txBody as Transaction.Body;
        const txGas = BigInt(txBody.gas) + BigInt(txBody.gas) * BigInt(255 / txBody.gasPriceCoef);
        if(BigInt(gasLimit) - txGas >= 0 ){
            return new ActionData(true);
        } else {
            let result = new ActionData(false);
            result.error = new Error("tx gas is too large");
            return result;
        }
    }

    public async checkCtx(ctx: CalculateUnitCtx): Promise<ActionResult> {
        const configSchema = Joi.object({
            gas_limit:Joi.number().min(21000).required()
        }).required();
        
        const verify = configSchema.validate(ctx.instanceConfig,{allowUnknown:true});
        if(verify.error != undefined || verify.errors != undefined){
            return new ActionResult(false,undefined,"",new Error(`instanceConfig invalid`));
        }
        return new ActionResult(true);
    }
}