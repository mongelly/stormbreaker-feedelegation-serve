import { BaseCalculateError } from "../baseCalculateError";
import { BaseCalculateNode } from "../baseCalculateNode";

export class Normal<R> extends BaseCalculateNode<R>{

    public readonly nodeID:string = "00000000-0000-0000-0001-ea983382561b";
    public readonly nodeName:string = "normal";

    public id:string = "";

    public async setSubCalculateNode(nodes: Array<BaseCalculateNode<R>|R>): Promise<void> {
        if(nodes != undefined && nodes.length == 1){
            this.subNodes = nodes;
        } else {
            throw BaseCalculateError.SUBNODESINVALID;
        }
    }

    public async calculate():Promise<R>{
        try {
            return this.subNodes[0] instanceof BaseCalculateNode ? await (this.subNodes[0] as BaseCalculateNode<R>).calculate() : this.subNodes[0];
        } catch (error) {
            throw BaseCalculateError.CALCULATEERROR(error);
        }
    }
}

export default new Normal();