import { ICalculateInstanceConfig } from "../calculateEngine/calculateInstanceConfig";

export abstract class BaseCalculateNode<R> {
    public readonly nodeID:string = "";
    public readonly nodeName:string = "";
    public parentTreeIDs:Array<string> = new Array();

    public instanceid:string = "";
    public env:any|undefined;
    public subNodes:Array<any> = new Array(); 

    public abstract calculate():Promise<R>;

    public get context() : any {
        return this._context;
    }

    public set context(value:any) {
        this._context = value;
        for (const node of this.subNodes) {
            if(node instanceof BaseCalculateNode){
                (node as BaseCalculateNode<any>).context = this._context;
            }
        }
    }

    public get instanceConfig():ICalculateInstanceConfig | undefined{
        return this._instanceConfig;
    }

    public set instanceConfig(value:ICalculateInstanceConfig | undefined){
        this._instanceConfig = value;
        for(const node of this.subNodes){
            if(node instanceof BaseCalculateNode){
                (node as BaseCalculateNode<any>).instanceConfig = this._instanceConfig;
            }
        }
    }
    
    protected _context:any;

    protected _instanceConfig:ICalculateInstanceConfig | undefined;
}

BaseCalculateNode.prototype.toString = function(){
    return "BaseCalculateNode";
}
