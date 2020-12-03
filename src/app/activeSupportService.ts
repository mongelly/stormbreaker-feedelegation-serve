import { environment } from ".";
import { ActionResult } from "../framework/components/actionResult";
import IActiveSupportServices from "../framework/components/iActiveSupportService";
import { LogHelper } from "../framework/helper/logHelper";
import { MysqlHelper } from "../framework/helper/mySqlHelper";

export default class ActiveSupportServices implements IActiveSupportServices{
    public async activieSupportServices():Promise<ActionResult> {
        let result = new ActionResult();
        result.Result = true;
        if(environment.config.mySqlConfig.actived){
            try {
                let mysqlHelperInstance = new MysqlHelper(environment.config.mySqlConfig);
                let testResult = await  mysqlHelperInstance.testConnection();
                if(testResult.Result){
                    environment.mySqlHelper = mysqlHelperInstance;
                    result.Result = true;
                } else {
                    (environment.logHelper as LogHelper).error(`MySQL [db:${environment.config.mySqlConfig.database}] Connection faild`);
                    result.Result = false;
                    return result;
                }
            } catch (error) {
                let errorMsg = `MySQL [db:${environment.config.mySqlConfig.database}] initialize faild`;
                (environment.logHelper as LogHelper).error(errorMsg);
                result.ErrorData = errorMsg;
                result.Result = false;
                return result;
            }
        }
        return result;
    }
}