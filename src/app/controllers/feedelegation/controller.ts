import Router from "koa-router";
import { iSignServe } from "../../../server/iSignServe";
import DelegatorManagerModel from "../../../server/model/delegatorManagerModel";
import { TxDelegatorHistoryModel } from "../../../server/model/txDelegationHistoryModel";
import { RemoteSignServe } from "../../../server/remoteSignServe";
import { BaseMiddleware } from "../../../utils/components/baseMiddleware";
import { SystemDefaultError } from "../../../utils/components/error";
import { ThorDevKitEx } from "../../../utils/extensions/thorDevkitExten";
import ConvertJSONResponeMiddleware from "../../../utils/middleware/convertJSONResponeMiddleware";
import AppErrorDefine from "../../components/error";

export default class FeeDelegationController extends BaseMiddleware{
    public sign:Router.IMiddleware;

    constructor(env:any){
        super(env);
        
        this.sign = async (ctx:Router.IRouterContext,next: () => Promise<any>) => {
            let raw = ctx.request.body.raw;
            let origin = ctx.request.body.origin;
            let appid = ctx.query.authorization;

            let loadDelegatorResult = await (new DelegatorManagerModel(this.environment)).getDelegator(appid);
            if(loadDelegatorResult.succeed && loadDelegatorResult.data != undefined && loadDelegatorResult.data.delegator != undefined){
                let removeServe:iSignServe = new RemoteSignServe(this.environment);
                let signResult = await removeServe.sign(raw,origin,loadDelegatorResult.data.delegator);
                if(signResult.succeed){
                    let transaction = ThorDevKitEx.decodeTxRaw(raw);
                    let saveLogResult = await (new TxDelegatorHistoryModel(this.environment)).insertTxDelegation(transaction.body,origin,loadDelegatorResult.data.delegator);
                    if(saveLogResult.succeed){
                        let signature = signResult.data!.signature;
                        this.convertSignJSONResult(ctx,"0x" + signature.toString("hex"));
                    } else {
                        ConvertJSONResponeMiddleware.errorJSONResponce(ctx,SystemDefaultError.INTERNALSERVERERROR);
                    }
                } else {
                    ConvertJSONResponeMiddleware.errorJSONResponce(ctx,AppErrorDefine.SIGNFAILD);
                }
            } else {
                ConvertJSONResponeMiddleware.errorJSONResponce(ctx,AppErrorDefine.SIGNFAILD);
            }
            await next();
        };
    }

    private convertSignJSONResult(ctx:Router.IRouterContext,signature:string){
        let body:any = {
            signature:signature
        }
        ConvertJSONResponeMiddleware.bodyToJSONResponce(ctx,body);
    }
    
}