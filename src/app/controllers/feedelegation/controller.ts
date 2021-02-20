import Router from "koa-router";
import CalculateConfigModel from "../../../server/calculate/calculateConfigModel";
import { iSignServe } from "../../../server/iSignServe";
import DelegatorManagerModel from "../../../server/model/delegatorManagerModel";
import { TxDelegatorHistoryModel } from "../../../server/model/txDelegationHistoryModel";
import { RemoteSignServe } from "../../../server/remoteSignServe";
import { ActionData, PromiseActionResult } from "../../../utils/components/actionResult";
import { BaseMiddleware } from "../../../utils/components/baseMiddleware";
import { SystemDefaultError } from "../../../utils/components/error";
import { ThorDevKitEx } from "../../../utils/extensions/thorDevkitExten";
import ConvertJSONResponeMiddleware from "../../../utils/middleware/convertJSONResponeMiddleware";
import AppErrorDefine from "../../components/error";
import path from "path";
import CalculateLoader from "../../../utils/calculateEngine/src/calculateEngine/calculateLoader";
import CalculateEngine from "../../../utils/calculateEngine/src/calculateEngine/calculateEngine";
import { ContainerResult } from "../../../utils/calculateEngine/src/calculateEngine/calculateContainer";

export default class FeeDelegationController extends BaseMiddleware{
    public sign:Router.IMiddleware;
    public trySign:Router.IMiddleware;

    constructor(env:any){
        super(env);
        
        this.sign = async (ctx:Router.IRouterContext,next: () => Promise<any>) => {
            let raw = ctx.request.body.raw;
            let origin = ctx.request.body.origin;
            let appid = ctx.query.authorization;

            let loadDelegatorResult = await (new DelegatorManagerModel(this.environment)).getDelegator(appid);
            if(loadDelegatorResult.succeed && loadDelegatorResult.data != undefined && loadDelegatorResult.data.delegator != undefined){
                let removeServe:iSignServe = new RemoteSignServe(this.environment);
                let signResult = await removeServe.sign(raw,origin,loadDelegatorResult.data.delegator);
                if(signResult.succeed){
                    let transaction = ThorDevKitEx.decodeTxRaw(raw);
                    let saveLogResult = await (new TxDelegatorHistoryModel(this.environment)).insertTxDelegation(appid,transaction.body,origin,loadDelegatorResult.data.delegator);
                    if(saveLogResult.succeed){
                        let signature = signResult.data!.signature;
                        this.convertSignJSONResult(ctx,"0x" + signature.toString("hex"));
                    } else {
                        ConvertJSONResponeMiddleware.errorJSONResponce(ctx,SystemDefaultError.INTERNALSERVERERROR);
                    }
                } else {
                    ConvertJSONResponeMiddleware.errorJSONResponce(ctx,AppErrorDefine.SIGNFAILD);
                }
            } else {
                ConvertJSONResponeMiddleware.errorJSONResponce(ctx,AppErrorDefine.SIGNFAILD);
            }
            await next();
        };
        
        this.trySign = async (ctx:Router.IRouterContext,next: () => Promise<any>) => {
            let appid = ctx.query.authorization;

            let configHelp = new CalculateConfigModel(this.environment);
            let getTreeNodeConfigPromise = configHelp.getCalculateTreeConfig(appid);
            let getInstanceConfigPromise = configHelp.getCalculateInstanceConfig(appid);

            let quaryResult = await PromiseActionResult.PromiseActionResult(Promise.all([getTreeNodeConfigPromise,getInstanceConfigPromise]));
            if(quaryResult.succeed && quaryResult.data){
                let treeConfig = (quaryResult.data.succeed[0] as ActionData<any>).data.treeNodeConfig;
                let instanceConfig = (quaryResult.data.succeed[1] as ActionData<any>).data.instanceConfig;
                let resource:Array<string> = [
                    path.join(__dirname,"../../../utils/calculateEngine/src/builtinUnits"),
                    path.join(__dirname,"../../../server/requestValidation/units")];

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
                    if(execResult.succeed){
                        let response = {
                            canSign:execResult.data,
                            result:this.convertContainerResultsToJson(container.containerResult)
                        };
                        ConvertJSONResponeMiddleware.bodyToJSONResponce(ctx,response);
                    } else {
                        ConvertJSONResponeMiddleware.errorJSONResponce(ctx,SystemDefaultError.INTERNALSERVERERROR);
                    }
                } catch (error) {
                    ConvertJSONResponeMiddleware.errorJSONResponce(ctx,SystemDefaultError.INTERNALSERVERERROR);
                }
            }
        }
    }

    private convertSignJSONResult(ctx:Router.IRouterContext,signature:string){
        let body:any = {
            signature:signature
        }
        ConvertJSONResponeMiddleware.bodyToJSONResponce(ctx,body);
    }

    private convertContainerResultsToJson(result:ContainerResult):any{
        let json = {
            baseInfo:result.baseInfo,
            executed:result.executed,
            success:result.result.succeed,
            result:(result.result as ActionData<any>).data,
            error:result.result.error || undefined,
            sub:new Array()
        };
        
        for(const value of result.subResults.values()){
            json.sub.push(this.convertContainerResultsToJson(value))
        }

        return json;
    }    
}