import BaseRequestFilterNode from "../baseRequestFilterNode";

export class TxOriginWhiteList extends BaseRequestFilterNode {

    public readonly nodeID:string = "8052e3c7-0a00-4047-a53e-a27841db5dd7";
    public readonly nodeName:string = "Tx origin whitelist";

    public async calculate(): Promise<boolean> {

        let config = this.instanceConfig!.configs.filter(config => { return config.instanceid == this.instanceid; })[0];
        if(config == undefined){
            throw new Error(`can't found instanceid: ${this.instanceid} instance config`);
        }

        let originWhiteList:Array<string> = config.config["origin_white_list"] as Array<string>;

        if(originWhiteList.find(address => {return address.toLocaleLowerCase() == this.context.origin.toLocaleLowerCase()}) != undefined){
            return true;
        }
        return false;
    }
}

export default new TxOriginWhiteList();