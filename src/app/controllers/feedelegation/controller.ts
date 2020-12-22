import Router from "koa-router";
import { BaseMiddleware } from "../../../framework/components/baseMiddleware";
import { iSignServe } from "../../../server/iSignServe";
import PaymentManagement from "../../../server/paymentManagement";
import { RemoteSignServe } from "../../../server/remoteSignServe";
import AppErrorDefine from "../../components/error";
import { ConvertJSONResponeMiddleware } from "../../middleware/convertJSONResponeMiddleware";

export default class FeeDelegationController extends BaseMiddleware{
    public sign:Router.IMiddleware;

    constructor(env:any){
        super(env);
        
        this.sign = async (ctx:Router.IRouterContext,next: () => Promise<any>) => {
            let raw = ctx.request.body.raw;
            let origin = ctx.request.body.origin;
            let appid = ctx.query.authorization;

            let loadDelegatorResult = await (new PaymentManagement(this.environment)).getDelegator(appid);
            if(loadDelegatorResult.Result && loadDelegatorResult.Data != undefined && loadDelegatorResult.Data.delegator != undefined){
                let removeServe:iSignServe = new RemoteSignServe(this.environment);
                let signResult = await removeServe.sign(raw,origin,loadDelegatorResult.Data.delegator);
                if(signResult.Result){
                    let signature = signResult.Data!.signature;
                    this.convertSignJSONResult(ctx,"0x" + signature.toString("hex"));
                } else {
                    ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,AppErrorDefine.SignFaild);
                }
            } else {
                ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,AppErrorDefine.SignFaild);
            }
            await next();
        };
    }

    private convertSignJSONResult(ctx:Router.IRouterContext,signature:string){
        let body:any = {
            signature:signature
        }
        ConvertJSONResponeMiddleware.BodyToJSONResponce(ctx,body);
    }
    
}