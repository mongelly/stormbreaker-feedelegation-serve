export class ActionResult {
    public succeed: boolean = false;
    public code: string | undefined;
    public message: string = "";
    public error: any;

    public copyBase(source: ActionResult) {
        this.succeed = source.succeed;
        this.code = source.code;
        this.message = source.message;
        this.error = source.error;
    }

    public constructor(succeed: boolean = false, code: string | undefined = undefined, msg: string = "", error: any = null) {
        this.succeed = succeed;
        this.code = code;
        this.message = msg;
        this.error = error;
    }
}

export class ActionData<T> extends ActionResult {
    public data: T | undefined;

    public constructor(data?: T) {
        super(data == undefined ? false : true);
        this.data = data;
    }

    public static all(actions: Array<ActionResult>): ActionData<{ succeed: Array<ActionResult>, failed: Array<ActionResult> }> {
        let result = new ActionData<{ succeed: Array<ActionResult>, failed: Array<ActionResult> }>();
        result.data = {
            succeed: new Array<ActionResult>(),
            failed: new Array<ActionResult>()
        };
        result.succeed = true;
        for (const sub of actions) {
            if (sub.succeed) {
                result.data.succeed.push(sub);
            } else {
                result.data.failed.push(sub);
                result.succeed = false;
            }
        }
        return result;
    }
}

export class PromiseActionResult {
    public static async PromiseActionResult(promise: Promise<any>): Promise<ActionData<{ succeed: Array<ActionResult>, failed: Array<ActionResult> }>> {
        let result = new ActionData<{ succeed: Array<ActionResult>, failed: Array<ActionResult> }>();
        result.data = {
            succeed: new Array<ActionResult>(),
            failed: new Array<ActionResult>()
        };
        result.succeed = true;
        let promiseAllResult = await promise;
        if (promiseAllResult.constructor.name == "Array") {
            for (let subResult of (promiseAllResult as Array<ActionResult>)) {
                if (subResult.succeed) {
                    result.data.succeed.push(subResult);
                } else {
                    result.data.failed.push(subResult);
                    result.succeed = false;
                }
            }
        } else if (typeof (promiseAllResult) == typeof (ActionResult)) {
            promiseAllResult = promiseAllResult as ActionResult;
            if (promiseAllResult.Result) {
                result.data.succeed.push(promiseAllResult);
            } else {
                result.data.failed.push(promiseAllResult);
                result.succeed = false;
            }
        }
        return result;
    }
}