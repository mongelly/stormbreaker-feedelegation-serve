import { ActionResultWithData } from "../framework/components/actionResult";
import { HttpClientHelper } from "../framework/helper/httpClientHelper";
import { iSignServe } from "./iSignServe";
import * as Path from 'path';
import AppErrorDefine from "../app/components/error";
import { HexStringHelper } from "../framework/helper/hexStringHelper";

export class RemoteSignServe implements iSignServe{

    constructor(env:any){
        this.env = env;
        this.url = this.env.config.remotesignserve.url;
    }
    public async sign(txRaw: string, origin:string,delegator: string): Promise<ActionResultWithData<{ signature: Buffer; }>> {
        let result = new ActionResultWithData<{ signature: Buffer; }>();
        let apiUrl = this.url + "/sign"
        let httpClient = new HttpClientHelper(apiUrl);
        let body:any = {
            raw:txRaw,
            delegator:delegator,
            origin:origin
        }
        let requestResult = await httpClient.doRequest("POST",undefined,undefined,body);
        if(requestResult.Result && requestResult.Data != undefined){
            let signature = requestResult.Data["signature"] as string;
            result.Data = { signature: HexStringHelper.ConvertToBuffer(signature) };
            result.Result = true
        } else {
            result.initKnowError(AppErrorDefine.SignFaild);
        }
        return result;
    }

    private env:any;
    private url:string = "";

}