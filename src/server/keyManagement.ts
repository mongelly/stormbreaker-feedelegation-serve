import {ActionResultWithData } from "../framework/components/actionResult";
import * as fileIO from 'fs';
import { HDNode, secp256k1 } from "thor-devkit/dist/cry";

export default class KeyManagement{
    constructor(env:any){
        this.environment = env;
        this.mnemonicFilePath = this.environment.config.mnemonicFilePath;
    }

    public async sign(hash:Buffer,delegator:string|undefined):Promise<ActionResultWithData<{signature:Buffer}>>{
        let result = new ActionResultWithData<{signature:Buffer}>();
        let initHDNodeResult = await this.initHDNode();
        if(initHDNodeResult.Result){
            let node = initHDNodeResult.Data!.hdNode;
            let privateKey = node.privateKey!;
            let signature = secp256k1.sign(hash,privateKey);
            result.Data = {signature:signature};
            result.Result = true;
        } else {
            result.copyBase(initHDNodeResult);
        }
        return result;
    }

    private async initHDNode():Promise<ActionResultWithData<{hdNode:HDNode}>>{
        let result = new ActionResultWithData<{hdNode:HDNode}>();

        try {
            let str = fileIO.readFileSync(this.mnemonicFilePath,"utf8");
            if(str.length > 0 && str.split(' ').length > 0){
                let words = str.split(' ');
                let node = HDNode.fromMnemonic(words);
                result.Data = {hdNode:node};
                result.Result = true;
            } else {
                result.Result = false;
                result.ErrorData = new Error("mnemonic invalid");
            }
        } catch (error) {
            result.Result = false;
            result.ErrorData = error;
        }

        return result;
    }

    private environment:any;
    private mnemonicFilePath:string = "";
}