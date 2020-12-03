import { BaseCalculateNode } from "./baseCalculateNode"
import { CalculateTreeConfig,CalculateTreeNodeDefine } from "../calculateEngine/calculateTreeConfig";
import { ActionResultWithData } from "../components/actionResult";

export default class CalculateFactory{

    public static async CreateCalculate(env: any,treeconfig: CalculateTreeConfig, 
        libraries: Map<string, BaseCalculateNode<any>>):Promise<ActionResultWithData<BaseCalculateNode<any>>>
    {
        let newCalculate = new CalculateFactory(env,treeconfig,libraries);
        return await newCalculate.createCalculate();
    }

    private constructor(env: any,treeconfig: CalculateTreeConfig,libraries: Map<string, BaseCalculateNode<any>>) {
        this.env = env;
        this.treeconfig = treeconfig;
        this.nodeLibraries = libraries;
    }

    private async createCalculate(): Promise<ActionResultWithData<BaseCalculateNode<any>>> {
        return this.createCalculateNode(this.treeconfig.root,this.nodeLibraries);
    }

    private createCalculateNode(nodeconfig: CalculateTreeNodeDefine,nodeLibrary: Map<string, BaseCalculateNode<any>>,parentNode?:BaseCalculateNode<any>): ActionResultWithData<BaseCalculateNode<any>> {
        let result = new ActionResultWithData<BaseCalculateNode<any>>();

        if (!nodeLibrary.has(nodeconfig.nodeid)) {
            result.Result = false;
            result.Message = `node module ${nodeconfig.nodeid} not found`;
            return result;
        }

        let calculateNode:BaseCalculateNode<any> = Object.create(nodeLibrary.get(nodeconfig.nodeid)!);
        calculateNode.instanceid = nodeconfig.instanceid;
        calculateNode.env = this.env;
        calculateNode.parentTreeIDs = new Array<string>();
        if(parentNode != undefined){
            calculateNode.parentTreeIDs.push(...parentNode.parentTreeIDs,parentNode.instanceid);
        }

        let subNodes = new Array<any>();
        if (nodeconfig.inputs.length > 0) {

            for (const input of nodeconfig.inputs) {
                switch (input.type) {
                    case "value":
                        subNodes.push(input.value);
                        break;
                    case "ref":
                        let refID = input.value;
                        let inputNodeConfig = this.treeconfig.references.find(ref => { return ref.instanceid == refID; });
                        if (inputNodeConfig == undefined) {
                            result.Result = false;
                            result.Message = `node module ${refID} not found`;
                            return result;
                        }
                        let inputNodeResult = this.createCalculateNode(inputNodeConfig,this.nodeLibraries,calculateNode);
                        if (!inputNodeResult.Result) {
                            result.copyBase(inputNodeResult);
                            return result;
                        }
                        let inputNode:BaseCalculateNode<any> = Object.create(inputNodeResult.Data!);
                        inputNode.env = this.env;

                        if(calculateNode.parentTreeIDs.find(existsID => {return existsID == inputNode.instanceid; })){
                            result.Result = false;
                            result.Message = `node module ${inputNode.instanceid} is in loop`;
                            return result;
                        }

                        subNodes.push(inputNode);
                        break;
                }
            }
        }

        try {
            calculateNode.subNodes = subNodes;
        } catch (error) {
            result.Result = false;
            result.Message = "sub node invalid";
            return result;
        }

        result.Data = calculateNode;
        result.Result = true;

        return result;
    }


    private env: any;
    private nodeLibraries: Map<string, BaseCalculateNode<any>> = new Map<string, BaseCalculateNode<any>>();
    private treeconfig:CalculateTreeConfig;
}