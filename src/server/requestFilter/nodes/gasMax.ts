import { Transaction } from "thor-devkit";
import { BigNumberEx } from "../../../framework/helper/bigNumberEx";
import BaseRequestFilterNode from "../baseRequestFilterNode";

export class GasMax extends BaseRequestFilterNode{

    public readonly nodeID:string = "a6e7c2a0-e7a0-4b7c-926a-03e1c9c0acd0";
    public readonly nodeName:string = "Gas Max";

    public async calculate(): Promise<boolean> {

        let config = this.instanceConfig!.configs.filter(config => { return config.instanceid == this.instanceid; })[0];
        if(config == undefined){
            throw new Error(`can't found instanceid: ${this.instanceid} instance config`);
        }

        let gasmax = config.config["gas_max"] as number;
        let txGas = (this.context!.txBody as Transaction.Body).gas;

        if(gasmax == undefined){
            throw new Error(`can't load gas_max config`);
        }

        if(new BigNumberEx(txGas).comparedTo(new BigNumberEx(gasmax)) == 1){
            return false;
        }
        return true;
    }
}

export default new GasMax();