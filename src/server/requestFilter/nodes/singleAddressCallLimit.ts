import { MysqlHelper } from "../../../framework/helper/mySqlHelper";
import BaseRequestFilterNode from "../baseRequestFilterNode";
import { TxDelegationHistoryHelper } from "../../txDelegationHistoryHelper";
import DateHelper from "../../../framework/helper/dateHelper";

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
        let endTs = DateHelper.getTimeStamp(new Date());
        let startTs = endTs - config.timeInterval;
        let historyHelper = new TxDelegationHistoryHelper(this.env);
        let queryResult = await historyHelper.selectHistroyCountByOriginAndSignTs(origin,startTs,endTs);
        if(queryResult.Result && queryResult.Data){
            return queryResult.Data.count < config.callLimit;
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