import Router from "koa-router";
import { ActionResult } from "../../framework/components/actionResult";
import { BaseMiddleware } from "../../framework/components/baseMiddleware";
import IError from "../../framework/components/iError";
import FrameworkErrorDefine from "../../framework/helper/error";

export class ConvertJSONResponeMiddleware extends BaseMiddleware{
    public static ActionResultJSONResponse(ctx:Router.IRouterContext,action:ActionResult,resultData?:any)
    {
        if(action.Result){
            this.BodyToJSONResponce(ctx,resultData);
        } else if ((action.ErrorData as IError) != null){
            this.KnowErrorJSONResponce(ctx,(action.ErrorData as IError));
        } else {
            this.KnowErrorJSONResponce(ctx,FrameworkErrorDefine.INTERNALSERVERERROR);
        }
    }

    public static KnowErrorJSONResponce(ctx:Router.IRouterContext,error:IError,statusCode?:number){
        ctx.status = statusCode ||400 ;
        ctx.body = {
            error:error.message,
            error_description:JSON.stringify(error.datails) || ""
        };
    }

    public static DataToJSONResponce(ctx:Router.IRouterContext,data:any = undefined,code:number = 1,message:string = ""){
        ctx.status = 200;
        ctx.body = data;
    }

    public static BodyToJSONResponce(ctx:Router.IRouterContext,body:any){
        ctx.status = 200;
        ctx.body = body;
    }
}