import Router from "koa-router";
import * as Joi from 'joi';
import { ConvertJSONResponeMiddleware } from "./convertJSONResponeMiddleware";
import DevkitExtension from "../../framework/helper/devkitExtension";
import { BaseMiddleware } from "../../framework/components/baseMiddleware";

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
                let transaction = DevkitExtension.decodeTransaction(ctx.request.body.raw);
                if(BigInt(transaction.body.chainTag) == BigInt(this.environment.config.thornode_config.chaintag)){
                    if(transaction.origin && transaction.origin.toLocaleLowerCase() != ctx.request.body.origin.toLowerCase()){
                        ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,{code:20000,message:"origin invalid",datails:undefined});
                    }
                    await next();
                } else {
                    ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,{code:20003,message:"chaintag invalid",datails:undefined});
                }
            } catch (error) {
                ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,{code:20001,message:"raw invalid",datails:undefined});
            }
        } else {
            ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,{code:20002,message:"request body invalid",datails:undefined});
        }
    }
}