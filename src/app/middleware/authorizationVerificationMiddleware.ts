import Router from "koa-router";
import AuthorizationModel from "../../server/model/authorizationModel";
import { BaseMiddleware } from "../../utils/components/baseMiddleware";
import ConvertJSONResponeMiddleware from "../../utils/middleware/convertJSONResponeMiddleware";

export class AuthorizationVerificationMiddleware extends BaseMiddleware
{
    public async authorizationVerification(ctx:Router.IRouterContext,next:()=>Promise<any>){
        let authorization = ctx.query.authorization;
        if(authorization != undefined){
            let am = new AuthorizationModel(this.environment);
            let getInfoResult = await am.getAuthorizationInfo(authorization);
            if(getInfoResult.succeed && getInfoResult.data != undefined){
                await next();
            } else {
                ConvertJSONResponeMiddleware.errorJSONResponce(ctx,AuthorizationError.UNAUTHORIZED);
            }
        } else {
            ConvertJSONResponeMiddleware.errorJSONResponce(ctx,AuthorizationError.UNAUTHORIZED);
        }
    }
}

export class AuthorizationError{
    public static UNAUTHORIZED = new Error("Unauthorized");
}