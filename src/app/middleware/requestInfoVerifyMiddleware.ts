import Router from "koa-router";
import * as Joi from 'joi';
import { BaseMiddleware } from "../../utils/components/baseMiddleware";
import { ThorDevKitEx } from "../../utils/extensions/thorDevkitExten";
import ConvertJSONResponeMiddleware from "../../utils/middleware/convertJSONResponeMiddleware";

export class RequestInfoVerifyMiddleware extends BaseMiddleware{

    constructor(env:any){
        super(env);
    }
    
    public async vip201RequestVerify(ctx:Router.IRouterContext,next:()=>Promise<any>){
        let requestVerifySchema = Joi.object({
            origin:Joi.string().lowercase().length(42).regex(/^(-0x|0x)[0-9a-f]*$/).required(),
            raw:Joi.string().lowercase().regex(/^(-0x|0x)[0-9a-f]*$/).required()
        }).required();
        let verify = requestVerifySchema.validate(ctx.request.body,{allowUnknown:true});
        if(!verify.error){
            try {
                let transaction = ThorDevKitEx.decodeTxRaw(ctx.request.body.raw);
                if(BigInt(transaction.body.chainTag) == BigInt(this.environment.config.thornode_config.chaintag)){
                    if(transaction.origin && transaction.origin.toLocaleLowerCase() != ctx.request.body.origin.toLowerCase()){
                        ConvertJSONResponeMiddleware.errorJSONResponce(ctx,RequestInfoVerifyError.ORIGININVALID);
                    }
                     if(!transaction.delegated){
                        ConvertJSONResponeMiddleware.errorJSONResponce(ctx,RequestInfoVerifyError.INVALIDDELEGATETX);
                     }

                    await next();
                } else {
                    ConvertJSONResponeMiddleware.errorJSONResponce(ctx,RequestInfoVerifyError.CHAINTAGINVALID);
                }
            } catch (error) {
                ConvertJSONResponeMiddleware.errorJSONResponce(ctx,RequestInfoVerifyError.RAWINVALID);
            }
        } else {
            ConvertJSONResponeMiddleware.errorJSONResponce(ctx,RequestInfoVerifyError.BADREQUEST);
        }
    }
}

export class RequestInfoVerifyError{
    public static ORIGININVALID = new Error("origin invalid");
    public static INVALIDDELEGATETX = new Error("it's not delegate tx");
    public static CHAINTAGINVALID = new Error("chaintag invalid");
    public static RAWINVALID = new Error("raw invalid");
    public static BADREQUEST = new Error("bad request");
}
