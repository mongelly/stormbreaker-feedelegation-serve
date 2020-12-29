import BaseRequestFilterNode from "../baseRequestFilterNode";
export class SmartContractWhiteList extends BaseRequestFilterNode{

    public readonly nodeID:string = "d0ebe102-8f42-46d3-a31f-aabc0b34b7af";
    public readonly nodeName:string = "Smart contract whitelist";

    public async calculate(): Promise<boolean> {
        
        let config = this.instanceConfig?.configs.filter(config => { return config.instanceid == this.instanceid; })[0];
        if(config == undefined){
            throw new Error(`can't found instanceid: ${this.instanceid} instance config`);
        }

        let smconfig = config.config as SmartContractWhiteListInstanceConfig;
        if(smconfig.smartcontract_whitelist && smconfig.smartcontract_whitelist.length > 0){
            for (const clause of this.context.txBody.clauses) {
                let item = smconfig.smartcontract_whitelist.filter(value => {return value.address.toLowerCase() == clause.to!.toLocaleLowerCase();})[0];
                if(item != undefined){
                    if(item.functionHashs.length > 0){
                        if(item.functionHashs.filter(hash => {return clause.data.length >= 10 && hash.toLowerCase() == clause.data.substr(0,10).toLowerCase()}).length == 0){
                            return false;
                        }
                    }
                } else {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
}

interface SmartContractWhiteListInstanceConfig{
    smartcontract_whitelist:Array<{
        address:string,
        functionHashs:Array<string>
    }>;
}

export default new SmartContractWhiteList();