import Router from "koa-router";
import { BaseMiddleware } from "../../framework/components/baseMiddleware";
import AuthorizationManager from "../../server/authorizationManager";
import { ConvertJSONResponeMiddleware } from "./convertJSONResponeMiddleware";

export class AuthorizationVerificationMiddleware extends BaseMiddleware
{
    public async authorizationVerification(ctx:Router.IRouterContext,next:()=>Promise<any>){
        let authorization = ctx.header.authorization;
        if(authorization != undefined){
            let am = new AuthorizationManager(this.environment);
            let getInfoResult = await am.getAuthorizationInfo(authorization);
            if(getInfoResult.Result && getInfoResult.Data != undefined){
                await next();
            } else {
                ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,{code:"401",message:"Unauthorized",datails:undefined},401);
            }
        } else {
            ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,{code:"401",message:"Unauthorized",datails:undefined},401);
        }
    }
}