import FeeDelegationController from "./controller";
import { AppVerificationMiddleware } from "../../middleware/appVerificationMiddleware";
import { TransactionValidationMiddleware } from "../../middleware/transactionValidationMiddleware";
import { RequestInfoVerifyMiddleware } from "../../middleware/requestInfoVerifyMiddleware";
import { BaseRouter } from "../../../utils/components/baseRouter";

export default class FeeDelegationRouter extends BaseRouter
{
    constructor(env:any){
        super(env);

        let requestInfoVerifyMiddleware = new RequestInfoVerifyMiddleware(this.environment);
        let appVerificationMiddleware = new AppVerificationMiddleware(this.environment);
        let transactionValidationMiddleware = new TransactionValidationMiddleware(this.environment);
        let feeDelegationController = new FeeDelegationController(this.environment);

        this.post("/sign",
            (ctx,next) => requestInfoVerifyMiddleware.vip201RequestVerify(ctx,next),
            (ctx,next) => appVerificationMiddleware.appVerification(ctx,next),
            (ctx,next) => transactionValidationMiddleware.transactionValidation(ctx,next),
            (ctx,next) => feeDelegationController.sign(ctx,next)
        );

        this.post("/sign/try",
            (ctx,next) => requestInfoVerifyMiddleware.vip201RequestVerify(ctx,next),
            (ctx,next) => appVerificationMiddleware.appVerification(ctx,next),
            (ctx,next) => feeDelegationController.trySign(ctx,next)
        );
    }
}