import GroupArray from "group-array";
import BaseRequestFilterNode from "../baseRequestFilterNode";

export class TxTargetWhiteList extends BaseRequestFilterNode{

    public readonly nodeID:string = "4e8ac062-1feb-4fd8-aab5-1afd5f095eb4";
    public readonly nodeName:string = "Tx target whitelist";
    
    public async calculate(): Promise<boolean> {
        let config = this.instanceConfig!.configs.filter(config => { return config.instanceid == this.instanceid; })[0];
        if(config == undefined){
            throw new Error(`can't found instanceid: ${this.instanceid} instance config`);
        }

        let targetWhiteList:Array<string> = config.config["target_white_list"] as Array<string>;

        let toAddresses:Array<string> = new Array<string>();
        let groupToAddress = GroupArray(this.context.txBody.clauses,"to");
        for(const toAddr in groupToAddress){
            toAddresses.push(toAddr.toLowerCase())
        }

        for(const toAddr of toAddresses){
            if(targetWhiteList.filter(target => {return target.toLowerCase() == toAddr.toLowerCase();}).length == 0){
                return false;
            }
        }
        return true;
    }
}

export default new TxTargetWhiteList();