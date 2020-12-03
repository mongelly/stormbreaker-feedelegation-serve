import { ActionResultWithData, ActionResult } from "./actionResult";

export default class PromiseWithActionResultEx {
    public static async ReturnActionResult(promise:Promise<any>) : Promise<ActionResultWithData<{succeed:Array<ActionResult>,failed:Array<ActionResult>}>>
    {
        let result = new ActionResultWithData<{succeed:Array<ActionResult>,failed:Array<ActionResult>}>();
        result.Data = {
            succeed:new Array<ActionResult>(),
            failed:new Array<ActionResult>()
        }
        result.Result = true;
        let promiseAllResult = await promise;
        if(promiseAllResult.constructor.name == "Array"){
            for(let subResult of (promiseAllResult as Array<ActionResult>)){
                if(subResult.Result){
                    result.Data.succeed.push(subResult);
                } else {
                    result.Data.failed.push(subResult);
                    result.Result = false;
                }
            }
        } else if (typeof(promiseAllResult) == typeof(ActionResult)){
            promiseAllResult = promiseAllResult as ActionResult;
            if(promiseAllResult.Result){
                result.Data.succeed.push(promiseAllResult);
            } else {
                result.Data.failed.push(promiseAllResult);
                result.Result = false;
            }
        }
        return result;
    }
}