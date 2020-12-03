import { BaseCalculateError } from "../baseCalculateError";
import { BaseCalculateNode } from "../baseCalculateNode";

export class Not extends BaseCalculateNode<boolean>{
    
    public readonly nodeID:string = "00000000-0000-0000-0001-6b4b00124992";
    public readonly nodeName:string = "not";

    public id:string = "";

    public async setSubCalculateNode(nodes: Array<BaseCalculateNode<boolean>|boolean>): Promise<void> {
        if(nodes != undefined  && nodes.length == 1
            && (nodes[0] instanceof BaseCalculateNode || typeof nodes[0] === "boolean")){
                this.subNodes = nodes;
            } else {
                throw BaseCalculateError.SUBNODESINVALID;
            }
    }

    public async calculate(): Promise<boolean> {
        try {
            return !(typeof this.subNodes[0] === "boolean" ? this.subNodes[0] : await (this.subNodes[0] as BaseCalculateNode<boolean>).calculate());
        } catch (error) {
            throw BaseCalculateError.CALCULATEERROR(error);
        }
    }
}

export default new Not();