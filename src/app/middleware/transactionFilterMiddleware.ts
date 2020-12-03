import Router from "koa-router";
import { ActionResultWithData } from "../../framework/components/actionResult";
import { ConvertJSONResponeMiddleware } from "./convertJSONResponeMiddleware";
import CalculateConfigHelper from "../../server/calculateConfigHelper";
import PromiseWithActionResultEx from "../../framework/components/promiseWithActionResultEx";
import FrameworkErrorDefine from "../../framework/helper/error";
import path from "path";
import CalculateEngine from "../../framework/calculateEngine/calculateEngine";
import DevkitExtension from "../../framework/helper/devkitExtension";
import { BaseMiddleware } from "../../framework/components/baseMiddleware";

export class TransactionFilterMiddleware extends BaseMiddleware
{
    constructor(env:any){
        super(env);
    }

    public async transactionFilter(ctx:Router.IRouterContext,next:()=>Promise<any>){
        let appid = ctx.header.authorization;

        let configHelp = new CalculateConfigHelper(this.environment);
        let getTreeNodeConfigPromise = configHelp.getCalculateTreeConfig(appid);
        let getInstanceConfigPromise = configHelp.getCalculateInstanceConfig(appid);

        let quaryResult = await PromiseWithActionResultEx.ReturnActionResult(Promise.all([getTreeNodeConfigPromise,getInstanceConfigPromise]));
        if(quaryResult.Result && quaryResult.Data){
            let treeConfig = (quaryResult.Data.succeed[0] as ActionResultWithData<any>).Data.treeNodeConfig;
            let instanceConfig = (quaryResult.Data.succeed[1] as ActionResultWithData<any>).Data.instanceConfig;
            let libraryPath:Array<string> = [
                path.join(__dirname,"../../framework/calculateEngine/baseCalculateNode"),
                path.join(__dirname,"../../server/requestFilter/nodes")];

            let calculateEngine = new CalculateEngine(this.environment);
            let libraries = (await calculateEngine.loadCalculateLibrary(treeConfig,libraryPath)).Data!;
            let calculateNode = (await calculateEngine.createCalculate(treeConfig,instanceConfig,libraries)).Data!;

            let context = {
                appid:appid,
                txBody:DevkitExtension.decodeTransaction(ctx.request.body.raw).body,
                origin:(ctx.request.body.origin as string).toLowerCase()
            }

            let execResult = await calculateEngine.execCalculate<boolean>(context,calculateNode);
            if(execResult.Result){
                if(execResult.Data){
                    await next();
                } else {
                    ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,{code:20005,message:"refuse to sign",datails:undefined});
                }
                
            } else {
                ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,FrameworkErrorDefine.INTERNALSERVERERROR);
            }
        } else {
            ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,FrameworkErrorDefine.INTERNALSERVERERROR);
        }
    }

    private env:any|undefined;
}