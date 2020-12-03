import IError from "./iError";

export class ActionResult
{
    public Result:boolean;
    public Code:string;
    public Message:string;
    public ErrorData:any|IError|null|undefined;

    constructor(){
        this.Result = false;
        this.Code = "";
        this.Message = "";
        this.ErrorData = undefined;
    }

    public copyBase(source:ActionResult)
    {
        this.Result = source.Result;
        this.Code = source.Code;
        this.Message = source.Message;
        this.ErrorData = source.ErrorData;
    }

    public initKnowError(knowerror:IError)
    {
        this.Result = false;
        this.Code = String(knowerror.code);
        this.ErrorData = knowerror;
    }

    public static all(actions:Array<ActionResult>) : ActionResultWithData<{succeed:Array<ActionResult>,failed:Array<ActionResult>}>{
        let result = new ActionResultWithData<{succeed:Array<ActionResult>,failed:Array<ActionResult>}>();
        result.Data = {
            succeed:new Array<ActionResult>(),
            failed: new Array<ActionResult>()
        };
        result.Result = true;
        for(let subResult of actions){
            if(subResult.Result){
                result.Data.succeed.push(subResult);
            } else {
                result.Data.failed.push(subResult);
                result.Result = false;
            }
        }
        return result;
    }
}

export class ActionResultWithData<T> extends ActionResult
{
    public Data?:T;
}

export class BaseResultWithData<T>
{
    public Data?:T|undefined;
}