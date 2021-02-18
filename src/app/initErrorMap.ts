import { SystemDefaultError } from "../utils/components/error";
import { errorMap } from "../utils/middleware/convertJSONResponeMiddleware";
import AppErrorDefine from "./components/error";
import { AppVerifactionError } from "./middleware/appVerificationMiddleware";
import { RequestInfoVerifyError } from "./middleware/requestInfoVerifyMiddleware";
import { REFUSETOSIGN } from "./middleware/transactionValidationMiddleware";

export const initErrorMap = function(){
    errorMap.set(SystemDefaultError.INTERNALSERVERERROR,{status:500,err:{error:SystemDefaultError.INTERNALSERVERERROR.message,error_detail:""}})
    errorMap.set(SystemDefaultError.BADREQUEST,{status:400,err:{error:SystemDefaultError.BADREQUEST.message,error_detail:""}})
    errorMap.set(AppVerifactionError.APPIDINVALID,{status:401,err:{error:AppVerifactionError.APPIDINVALID.message,error_detail:""}})
    errorMap.set(AppErrorDefine.SIGNFAILD,{status:500,err:{error:AppErrorDefine.SIGNFAILD.message,error_detail:""}})
    errorMap.set(RequestInfoVerifyError.ORIGININVALID,{status:400,err:{error:RequestInfoVerifyError.ORIGININVALID.message,error_detail:""}})
    errorMap.set(RequestInfoVerifyError.INVALIDDELEGATETX,{status:400,err:{error:RequestInfoVerifyError.INVALIDDELEGATETX.message,error_detail:""}})
    errorMap.set(RequestInfoVerifyError.CHAINTAGINVALID,{status:400,err:{error:RequestInfoVerifyError.CHAINTAGINVALID.message,error_detail:""}})
    errorMap.set(RequestInfoVerifyError.RAWINVALID,{status:400,err:{error:RequestInfoVerifyError.RAWINVALID.message,error_detail:""}})
    errorMap.set(REFUSETOSIGN,{status:400,err:{error:REFUSETOSIGN.message,error_detail:""}})
}