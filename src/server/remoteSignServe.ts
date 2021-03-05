import { iSignServe } from "./iSignServe";
import AppErrorDefine from "../app/components/error";
import { ActionData } from "../utils/components/actionResult";
import { HttpClientHelper } from "../utils/helper/httpClientHelper";
import { HexStringHelper } from "../utils/helper/hexStringHelper";

export class RemoteSignServe implements iSignServe{

    constructor(env:any){
        this.env = env;
        this.url = this.env.config.remotesignserve.url;
    }
    public async sign(txRaw: string, origin:string,delegator: string): Promise<ActionData<{ signature: Buffer; }>> {
        let result = new ActionData<{ signature: Buffer; }>();
        let apiUrl = this.url + "/sign"
        let httpClient = new HttpClientHelper();
        let body:any = {
            raw:txRaw,
            delegator:delegator,
            origin:origin
        }
        let requestResult = await httpClient.request(apiUrl,"POST",undefined,undefined,body);
        if(requestResult.error != undefined && requestResult.data != undefined){
            let signature = requestResult.data.body["signature"] as string;
            result.data = { signature: HexStringHelper.ConvertToBuffer(signature) };
        } else {
            result.error = AppErrorDefine.SIGNFAILD;
        }
        return result;
    }

    private env:any;
    private url:string = "";

}