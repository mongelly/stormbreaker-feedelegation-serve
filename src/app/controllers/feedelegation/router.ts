import FeeDelegationController from "./controller";
import { AuthorizationVerificationMiddleware } from "../../middleware/authorizationVerificationMiddleware";
import { TransactionFilterMiddleware } from "../../middleware/transactionFilterMiddleware";
import { RequestInfoVerifyMiddleware } from "../../middleware/requestInfoVerifyMiddleware";
import { BaseRouter } from "../../../utils/components/baseRouter";

export default class FeeDelegationRouter extends BaseRouter
{
    constructor(env:any){
        super(env);

        let requestInfoVerifyMiddleware = new RequestInfoVerifyMiddleware(this.environment);
        let authorizationVerificationMiddleware = new AuthorizationVerificationMiddleware(this.environment);
        let transactionFilterMiddleware = new TransactionFilterMiddleware(this.environment);
        let feeDelegationController = new FeeDelegationController(this.environment);

        this.post("/sign",
            (ctx,next) => requestInfoVerifyMiddleware.vip201RequestVerify(ctx,next),
            (ctx,next) => authorizationVerificationMiddleware.authorizationVerification(ctx,next),
            (ctx,next) => transactionFilterMiddleware.transactionFilter(ctx,next),
            (ctx,next) => feeDelegationController.sign(ctx,next)
            );
    }
}