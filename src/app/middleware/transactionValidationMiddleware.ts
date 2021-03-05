import Router from "koa-router";
import path from "path";
import { BaseMiddleware } from "../../utils/components/baseMiddleware";
import { ActionData, PromiseActionResult } from "../../utils/components/actionResult";
import { ThorDevKitEx } from "../../utils/extensions/thorDevkitExten";
import ConvertJSONResponeMiddleware from "../../utils/middleware/convertJSONResponeMiddleware";
import { SystemDefaultError } from "../../utils/components/error";
import CalculateConfigModel from "../../server/calculate/calculateConfigModel";
import CalculateLoader from "../../utils/calculateEngine/src/calculateEngine/calculateLoader";
import CalculateEngine from "../../utils/calculateEngine/src/calculateEngine/calculateEngine";

export class TransactionValidationMiddleware extends BaseMiddleware
{
    constructor(env:any){
        super(env);
    }

    public async transactionValidation(ctx:Router.IRouterContext,next:()=>Promise<any>){
        let appid = ctx.query.authorization;

        let configHelp = new CalculateConfigModel(this.environment);
        let getTreeNodeConfigPromise = configHelp.getCalculateTreeConfig(appid);
        let getInstanceConfigPromise = configHelp.getCalculateInstanceConfig(appid);

        let quaryResult = await PromiseActionResult.PromiseActionResult(Promise.all([getTreeNodeConfigPromise,getInstanceConfigPromise]));
        if(quaryResult.error != undefined && quaryResult.data){
            let treeConfig = (quaryResult.data.succeed[0] as ActionData<any>).data.treeNodeConfig;
            let instanceConfig = (quaryResult.data.succeed[1] as ActionData<any>).data.instanceConfig;
            let resource:Array<string> = [
                path.join(__dirname,"../../utils/calculateEngine/src/builtinUnits"),
                path.join(__dirname,"../../server/requestValidation/units")];

            try {
                let units = (await CalculateLoader.loadUnits(resource)).data!;
                let container = (await CalculateEngine.calculateUnitBuilder(this.environment,treeConfig,instanceConfig,units)).data!

                let context = {
                    appid:appid,
                    txBody:ThorDevKitEx.decodeTxRaw(ctx.request.body.raw).body,
                    origin:(ctx.request.body.origin as string).toLowerCase(),
                    requestContext:ctx
                }

                let execResult = await container.exec(context);
                if(execResult.error != undefined){
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
        }
    }
}

export let REFUSETOSIGN = new Error("refuse to sign");