import { BaseCalculateNode } from '../../framework/calculateEngine/baseCalculateNode';

export default abstract class BaseRequestFilterNode extends BaseCalculateNode<boolean>
{
    public id:string = "";
    public env:any|undefined = undefined;

    public async setSubCalculateNode(nodes:Array<BaseCalculateNode<boolean>|boolean>):Promise<void>{
        this.subNodes = nodes;
    }  
}