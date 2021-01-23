import FeeDelegationController from "./controller";
import { AuthorizationVerificationMiddleware } from "../../middleware/authorizationVerificationMiddleware";
import { TransactionValidationMiddleware } from "../../middleware/transactionValidationMiddleware";
import { RequestInfoVerifyMiddleware } from "../../middleware/requestInfoVerifyMiddleware";
import { BaseRouter } from "../../../utils/components/baseRouter";

export default class FeeDelegationRouter extends BaseRouter
{
    constructor(env:any){
        super(env);

        let requestInfoVerifyMiddleware = new RequestInfoVerifyMiddleware(this.environment);
        let authorizationVerificationMiddleware = new AuthorizationVerificationMiddleware(this.environment);
        let transactionValidationMiddleware = new TransactionValidationMiddleware(this.environment);
        let feeDelegationController = new FeeDelegationController(this.environment);

        this.post("/sign",
            (ctx,next) => requestInfoVerifyMiddleware.vip201RequestVerify(ctx,next),
            (ctx,next) => authorizationVerificationMiddleware.authorizationVerification(ctx,next),
            (ctx,next) => transactionValidationMiddleware.transactionValidation(ctx,next),
            (ctx,next) => feeDelegationController.sign(ctx,next)
            );
    }
}