import Joi from "joi";
import { CalculateUnitCtx } from "../../../utils/calculateEngine/src/calculateEngine/baseCalculateUnit";
import { ActionData, ActionResult } from "../../../utils/calculateEngine/src/utils/components/actionResult";
import BaseRequestFilterUnit from "../baseRequestFilterUnit";

export class SmartContractWhiteList extends BaseRequestFilterUnit{

    public readonly unitID:string = "d0ebe102-8f42-46d3-a31f-aabc0b34b7af";
    public readonly unitName:string = "Smart contract whitelistit";

    public async calculate(ctx: CalculateUnitCtx): Promise<ActionData<boolean>> {
        let config = ctx.instanceConfig as SmartContractWhiteListInstanceConfig;
        if(config.smartcontract_whitelist && config.smartcontract_whitelist.length > 0){
            for (const clause of ctx.context.txBody.clauses) {
                let item = config.smartcontract_whitelist.filter(value => {return value.address.toLowerCase() == clause.to!.toLocaleLowerCase();})[0];
                if(item != undefined){
                    if(item.functionHashs.length > 0){
                        if(item.functionHashs.filter(hash => {return clause.data.length >= 10 && hash.toLowerCase() == clause.data.substr(0,10).toLowerCase()}).length == 0){
                            return new ActionData(false);
                        }
                    }
                } else {
                    return new ActionData(false);
                }
            }
            return new ActionData(true);
        } else {
            return new ActionData(false);
        }
    }

    public async checkCtx(ctx: CalculateUnitCtx): Promise<ActionResult> {
        const configSchema = Joi.array().items({
            address:Joi.string().lowercase().length(42).regex(/^(-0x|0x)[0-9a-f]*$/).required(),
            functionHashs:Joi.array().items(Joi.string().lowercase().length(10).regex(/^(-0x|0x)[0-9a-f]*$/))
        }).required();
        const verify = configSchema.validate(ctx.instanceConfig,{allowUnknown:true});
        if(verify.error != undefined || verify.errors != undefined){
            return new ActionResult(false,undefined,"",new Error(`instanceConfig invalid`));
        }

        return new ActionResult(true);
    }

}

interface SmartContractWhiteListInstanceConfig{
    smartcontract_whitelist:Array<{
        address:string,
        functionHashs:Array<string>
    }>;
}

// export class SmartContractWhiteList extends BaseRequestFilterNode{

//     public readonly nodeID:string = "d0ebe102-8f42-46d3-a31f-aabc0b34b7af";
//     public readonly nodeName:string = "Smart contract whitelist";

//     public async calculate(): Promise<boolean> {
        
//         let config = this.instanceConfig?.configs.filter(config => { return config.instanceid == this.instanceid; })[0];
//         if(config == undefined){
//             throw new Error(`can't found instanceid: ${this.instanceid} instance config`);
//         }

//         let smconfig = config.config as SmartContractWhiteListInstanceConfig;
//         if(smconfig.smartcontract_whitelist && smconfig.smartcontract_whitelist.length > 0){
//             for (const clause of this.context.txBody.clauses) {
//                 let item = smconfig.smartcontract_whitelist.filter(value => {return value.address.toLowerCase() == clause.to!.toLocaleLowerCase();})[0];
//                 if(item != undefined){
//                     if(item.functionHashs.length > 0){
//                         if(item.functionHashs.filter(hash => {return clause.data.length >= 10 && hash.toLowerCase() == clause.data.substr(0,10).toLowerCase()}).length == 0){
//                             return false;
//                         }
//                     }
//                 } else {
//                     return false;
//                 }
//             }
//             return true;
//         } else {
//             return false;
//         }
//     }
// }



// export default new SmartContractWhiteList();