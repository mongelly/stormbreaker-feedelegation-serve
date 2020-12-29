import { SystemDefaultError } from "../utils/components/error";
import { errorMap } from "../utils/middleware/convertJSONResponeMiddleware";

export const initErrorMap = function(){
    errorMap.set(SystemDefaultError.INTERNALSERVERERROR,{status:500,err:{error:SystemDefaultError.INTERNALSERVERERROR.message,error_detail:""}})
    errorMap.set(SystemDefaultError.BADREQUEST,{status:400,err:{error:SystemDefaultError.BADREQUEST.message,error_detail:""}})
}