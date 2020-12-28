import { BaseCalculateNode } from "./baseCalculateNode";
import { ICalculateInstanceConfig } from "../calculateEngine/calculateInstanceConfig";
import { ICalculateTreeConfig } from "../calculateEngine/calculateTreeConfig";
import { BaseCalculateError } from "./baseCalculateError";
import fs from 'fs';
import * as Path from 'path';
import CalculateFactory from "./calculateFactory";
import { ActionData } from "../components/actionResult";

export default class CalculateEngine{

    public constructor(env:any){
        this.env = env;
    }

    public async loadCalculateLibrary(treeConfig:ICalculateTreeConfig,libraryPath:Array<string>):Promise<ActionData<Map<string,BaseCalculateNode<any>>>>{
        let result = new ActionData<Map<string,BaseCalculateNode<any>>>();

        let nodeIDMap = new Map<string,BaseCalculateNode<any>|undefined>();
        nodeIDMap.set(treeConfig.root.nodeid,undefined);
        for(const ref of treeConfig.references){
            nodeIDMap.set(ref.nodeid,undefined);
        }

        for(const path of libraryPath){
            let libraryFiles = fs.readdirSync(path);
            libraryFiles = libraryFiles.filter(filename => {return filename.substring(filename.lastIndexOf(".")).toLocaleLowerCase() == ".js"});
            for(const libraryFile of libraryFiles){
                let libraryPath = Path.join(path,libraryFile)
                let library = require(libraryPath);
                if(library.default && library.default.__proto__.toString() == "BaseCalculateNode"){
                    let nodeid = (library.default as BaseCalculateNode<any>).nodeID;
                    if(nodeIDMap.has(nodeid)){
                        nodeIDMap.set(nodeid,library.default);
                    }
                }
            }
        }

        for (const [key,valud] of nodeIDMap) {
            if(valud == undefined){
                result.succeed = false;
                result.error = BaseCalculateError.CREATEERROR(`not found nodeid: ${key} library file`);
                return result;
            }
        }
        result.data = nodeIDMap as Map<string,BaseCalculateNode<any>>;
        result.succeed = true;
        return result;   
    }

    public async createCalculate(treeConfig:ICalculateTreeConfig,instanceConfig:ICalculateInstanceConfig,libraries:Map<string,BaseCalculateNode<any>>):Promise<ActionData<BaseCalculateNode<any>>>
    {
        let crateResult = await CalculateFactory.CreateCalculate(this.env,treeConfig,libraries);
        if(crateResult.succeed){
            crateResult.data!.instanceConfig = instanceConfig;
            return crateResult;
        } else {
            return crateResult;
        }
    }

    public async execCalculate<R>(context:any,calculate:BaseCalculateNode<R>):Promise<ActionData<R>>{
        let result = new ActionData<R>();
        let calculateNode:BaseCalculateNode<R> = Object.create(calculate);
        calculateNode.context = context;
        try {
            let calculateValue = await calculateNode.calculate();
            result.data = calculateValue;
            result.succeed = true;
        } catch (error) {
            result.error = error;
            result.succeed = false;
        }
        return result;
    }

    private env:any;
}