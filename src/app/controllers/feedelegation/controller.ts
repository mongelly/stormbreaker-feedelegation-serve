import Router from "koa-router";
import { secp256k1 } from "thor-devkit/dist/cry";
import { BaseMiddleware } from "../../../framework/components/baseMiddleware";
import DevkitExtension from "../../../framework/helper/devkitExtension";
import FrameworkErrorDefine from "../../../framework/helper/error";
import { TxDelegationHistoryHelper } from "../../../server/txDelegationHistoryHelper";
import { ConvertJSONResponeMiddleware } from "../../middleware/convertJSONResponeMiddleware";

export default class FeeDelegationController extends BaseMiddleware{
    public sign:Router.IMiddleware;

    constructor(env:any){
        super(env);
        
        this.sign = async (ctx:Router.IRouterContext,next: () => Promise<any>) => {
            let raw = ctx.request.body.raw;
            let origin = ctx.request.body.origin;

            let tx = DevkitExtension.decodeTransaction(raw);
            let signHash = tx.signingHash(origin);

            //address:0x47109a193c49862c89bd76fe2de3585743dd2bb0
            let delegatorPriKey = Buffer.from("547fb081e73dc2e22b4aae5c60e2970b008ac4fc3073aebc27d41ace9c4f53e9","hex");
            let signature = secp256k1.sign(signHash, delegatorPriKey);

            let insertResult = await (new TxDelegationHistoryHelper(this.environment)).insertTxDelegation(tx.body,origin,"0x47109a193c49862c89bd76fe2de3585743dd2bb0");
            if(insertResult.Result){
                this.convertSignJSONResult(ctx,signature.toString("hex"));
            } else {
                ConvertJSONResponeMiddleware.KnowErrorJSONResponce(ctx,FrameworkErrorDefine.INTERNALSERVERERROR);
            }
        };
    }

    private convertSignJSONResult(ctx:Router.IRouterContext,signature:string){
        let body:any = {
            signature:signature
        }
        ConvertJSONResponeMiddleware.BodyToJSONResponce(ctx,body);
    }
}