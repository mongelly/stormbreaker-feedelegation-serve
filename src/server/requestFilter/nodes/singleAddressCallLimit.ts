import BaseRequestFilterNode from "../baseRequestFilterNode";
import { DateEx } from "../../../utils/extensions/dateEx";
import { TxDelegatorHistoryModel } from "../../model/txDelegationHistoryModel";


export class SingleAddressCallLimit extends BaseRequestFilterNode {

    public readonly nodeID:string = "0786acd0-7f6b-445e-9d5e-94432c551461";
    public readonly nodeName:string = "Single address call limit";

    public async calculate(): Promise<boolean> {
        let instanceConfig = this.instanceConfig?.configs.filter(config => { return config.instanceid == this.instanceid; })[0];
        if(instanceConfig == undefined){
            throw new Error(`can't found instanceid: ${this.instanceid} instance config`);
        }

        let config = instanceConfig.config as SingleAddressCallLimitConfig;
        let origin = this.context.origin.toLocaleLowerCase();
        let endTs = DateEx.getTimeStamp(new Date());
        let startTs = endTs - config.timeInterval;
        let historyHelper = new TxDelegatorHistoryModel(this.env);
        let queryResult = await historyHelper.selectHistroyCountByOriginAndSignTs(origin,startTs,endTs);
        if(queryResult.succeed && queryResult.data){
            return queryResult.data.count < config.callLimit;
        } else {
            return false;
        }
    }
}

interface SingleAddressCallLimitConfig{
    callLimit:number,
    timeInterval:number
}

export default new SingleAddressCallLimit();