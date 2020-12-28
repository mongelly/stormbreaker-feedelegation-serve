import Router from "koa-router";
import path from "path";
import { BaseMiddleware } from "../../utils/components/baseMiddleware";
import { ActionData, PromiseActionResult } from "../../utils/components/actionResult";
import CalculateEngine from "../../utils/calculateEngine/calculateEngine";
import { ThorDevKitEx } from "../../utils/extensions/thorDevkitExten";
import ConvertJSONResponeMiddleware from "../../utils/middleware/convertJSONResponeMiddleware";
import { SystemDefaultError } from "../../utils/components/error";
import CalculateConfigModel from "../../server/calculate/calculateConfigModel";

export class TransactionFilterMiddleware extends BaseMiddleware
{
    constructor(env:any){
        super(env);
    }

    public async transactionFilter(ctx:Router.IRouterContext,next:()=>Promise<any>){
        let appid = ctx.query.authorization;

        let configHelp = new CalculateConfigModel(this.environment);
        let getTreeNodeConfigPromise = configHelp.getCalculateTreeConfig(appid);
        let getInstanceConfigPromise = configHelp.getCalculateInstanceConfig(appid);

        let quaryResult = await PromiseActionResult.PromiseActionResult(Promise.all([getTreeNodeConfigPromise,getInstanceConfigPromise]));
        if(quaryResult.succeed && quaryResult.data){
            let treeConfig = (quaryResult.data.succeed[0] as ActionData<any>).data.treeNodeConfig;
            let instanceConfig = (quaryResult.data.succeed[1] as ActionData<any>).data.instanceConfig;
            let libraryPath:Array<string> = [
                path.join(__dirname,"../../utils/calculateEngine/baseCalculateNode"),
                path.join(__dirname,"../../server/requestFilter/nodes")];

            let calculateEngine = new CalculateEngine(this.environment);
            let libraries = (await calculateEngine.loadCalculateLibrary(treeConfig,libraryPath)).data!;
            let calculateNode = (await calculateEngine.createCalculate(treeConfig,instanceConfig,libraries)).data!;

            let context = {
                appid:appid,
                txBody:ThorDevKitEx.decodeTxRaw(ctx.request.body.raw).body,
                origin:(ctx.request.body.origin as string).toLowerCase(),
                recaptcha:(ctx.query.recaptcha as string)
            }
            
            try {
                let execResult = await calculateEngine.execCalculate<boolean>(context,calculateNode);
                if(execResult.succeed){
                    if(execResult.data){
                        await next();
                    } else {
                        ConvertJSONResponeMiddleware.errorJSONResponce(ctx,REFUSETOSIGN);
                    }
                    
                } else {
                    ConvertJSONResponeMiddleware.errorJSONResponce(ctx,SystemDefaultError.INTERNALSERVERERROR);
                }
            } catch (error) {
                ConvertJSONResponeMiddleware.errorJSONResponce(ctx,SystemDefaultError.INTERNALSERVERERROR);
            }
        } else {
            ConvertJSONResponeMiddleware.errorJSONResponce(ctx,SystemDefaultError.INTERNALSERVERERROR);
        }
    }
}

export let REFUSETOSIGN = new Error("refuse to sign");