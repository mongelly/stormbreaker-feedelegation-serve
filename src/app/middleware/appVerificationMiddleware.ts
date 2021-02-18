import Router from "koa-router";
import AppModel from "../../server/model/appModel";
import { BaseMiddleware } from "../../utils/components/baseMiddleware";
import ConvertJSONResponeMiddleware from "../../utils/middleware/convertJSONResponeMiddleware";

export class AppVerificationMiddleware extends BaseMiddleware
{
    public async appVerification(ctx:Router.IRouterContext,next:()=>Promise<any>){
        let appid = ctx.query.authorization;
        if(appid != undefined){
            let am = new AppModel(this.environment);
            let getInfoResult = await am.getAppInfo(appid);
            if(getInfoResult.succeed && getInfoResult.data != undefined){
                await next();
            } else {
                ConvertJSONResponeMiddleware.errorJSONResponce(ctx,AppVerifactionError.APPIDINVALID);
            }
        } else {
            ConvertJSONResponeMiddleware.errorJSONResponce(ctx,AppVerifactionError.APPIDINVALID);
        }
    }
}

export class AppVerifactionError{
    public static APPIDINVALID = new Error("Appid invalid");
}