import Router from "koa-router";
import { BaseMiddleware } from "../../../framework/components/baseMiddleware";
import DevkitExtension from "../../../framework/helper/devkitExtension";
import FrameworkErrorDefine from "../../../framework/helper/error";
import KeyManagement from "../../../server/keyManagement";
import { ConvertJSONResponeMiddleware } from "../../middleware/convertJSONResponeMiddleware";

export default class FeeDelegationController extends BaseMiddleware{
    public sign:Router.IMiddleware;

    constructor(env:any){
        super(env);
        
        this.sign = async (ctx:Router.IRouterContext,next: () => Promise<any>) => {
            let raw = ctx.request.body.raw;
            let origin = ctx.request.body.origin;

            let tx = DevkitExtension.decodeTransaction(raw);
            let signHash = tx.signingHash(origin);

            let signResult = await (new KeyManagement(this.environment)).sign(signHash,undefined);
            if(signResult.Result){
                let signature = signResult.Data!.signature;
                this.convertSignJSONResult(ctx,signature.toString("hex"));
            } else {
                ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,FrameworkErrorDefine.INTERNALSERVERERROR);
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