
import { CalculateUnitCtx } from "../../../utils/calculateEngine/src/calculateEngine/baseCalculateUnit";
import { ActionData, ActionResult } from "../../../utils/calculateEngine/src/utils/components/actionResult";
import { DateEx } from "../../../utils/extensions/dateEx";
import { TxDelegatorHistoryModel, TxFilter } from "../../model/txDelegationHistoryModel";
import BaseRequestValidationUnit from "../baseRequestValidationUnit";
import * as Joi from 'joi';


export default class SingleAddressCallLimit extends BaseRequestValidationUnit {


    public readonly unitID:string = "0786acd0-7f6b-445e-9d5e-94432c551461";
    public readonly unitName:string = "Single address call limit";

    public async calculate(ctx: CalculateUnitCtx): Promise<ActionData<boolean>> {
        const config = ctx.instanceConfig as SingleAddressCallLimitConfig;
        const origin = ctx.context.origin.toLocaleLowerCase();
        const endTs = DateEx.getTimeStamp(new Date());
        const startTs = endTs - config.timeInterval;
        let filter = new TxFilter();
        filter.origins = [origin];
        filter.starts = startTs;
        filter.endts = endTs;
        let historyHelper = new TxDelegatorHistoryModel(ctx.env);
        let queryResult = await historyHelper.selectHistoryCountByFilter(filter);
        if(queryResult.succeed && queryResult.data){
            return new ActionData(queryResult.data.count < config.callLimit);
        } else {
            return new ActionData(false);
        }
    }


    public async checkCtx(ctx: CalculateUnitCtx): Promise<ActionResult> {
        return await this.checkInstanceConfig(ctx.instanceConfig);
    }

    public async checkInstanceConfig(instanceConfig: any): Promise<ActionResult> {
        if(instanceConfig == undefined){
            return new ActionResult(false,undefined,"",new Error(`instanceConfig undefined`));
        }
        const configSchema = Joi.object({
            callLimit:Joi.number().min(1).required(),
            timeInterval:Joi.number().min(1).required()
        }).required();
        const verify = configSchema.validate(instanceConfig,{allowUnknown:true});
        if(verify.error != undefined || verify.errors != undefined){
            return new ActionResult(false,undefined,"",new Error(`instanceConfig invalid`));
        }
        return new ActionResult(true);
    }
}

interface SingleAddressCallLimitConfig{
    callLimit:number,
    timeInterval:number
}