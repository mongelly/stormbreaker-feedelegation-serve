import { BaseGlobalEnvironment } from "../framework/components/baseGlobalEnvironment";
import { BaseRouter } from "../framework/components/baseRouter";
import { LogHelper } from "../framework/helper/logHelper";

export class GlobalEnvironment extends BaseGlobalEnvironment{
    public logHelper:LogHelper = new LogHelper();
    public routerArray:Array<BaseRouter> = new Array<BaseRouter>();

    constructor(config:any){
        super(config);
        this._initLogHelper(config);
    }

    private _initLogHelper(config:any){
        this.logHelper.init(config);
    }
}