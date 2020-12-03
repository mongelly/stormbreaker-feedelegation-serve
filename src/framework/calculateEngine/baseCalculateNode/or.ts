import { BaseCalculateError } from "../baseCalculateError";
import { BaseCalculateNode } from "../baseCalculateNode";

export class Or extends BaseCalculateNode<boolean>{
    
    public readonly nodeID:string = "00000000-0000-0000-0001-cd6ca1e1a606";
    public readonly nodeName:string = "or";

    public id:string = "";

    public async setSubCalculateNode(nodes: Array<BaseCalculateNode<boolean>|boolean>): Promise<void> {
        if(nodes != undefined  && nodes.length == 2 
            && (nodes[0] instanceof BaseCalculateNode || typeof nodes[0] === "boolean")
            && (nodes[1] instanceof BaseCalculateNode || typeof nodes[1] === "boolean")){
                this.subNodes = nodes;
            } else {
                throw BaseCalculateError.SUBNODESINVALID;
            }
    }

    public async calculate(): Promise<boolean> {
        try {
            let left = typeof this.subNodes[0] === "boolean" ? this.subNodes[0] : await (this.subNodes[0] as BaseCalculateNode<boolean>).calculate();
            if(left){
                return true;
            }
            let right = typeof this.subNodes[1] === "boolean" ? this.subNodes[1] : await (this.subNodes[1] as BaseCalculateNode<boolean>).calculate();
            return left || right;
        } catch (error) {
            throw BaseCalculateError.CALCULATEERROR(error);
        }
    }
}

export default new Or();