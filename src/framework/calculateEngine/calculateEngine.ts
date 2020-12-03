import { BaseCalculateNode } from "./baseCalculateNode";
import { CalculateInstanceConfig } from "../calculateEngine/calculateInstanceConfig";
import { CalculateTreeConfig } from "../calculateEngine/calculateTreeConfig";
import { ActionResultWithData } from "../components/actionResult";
import { BaseCalculateError } from "./baseCalculateError";
import fs from 'fs';
import * as Path from 'path';
import CalculateFactory from "./calculateFactory";

export default class CalculateEngine{

    public constructor(env:any){
        this.env = env;
    }

    public async loadCalculateLibrary(treeConfig:CalculateTreeConfig,libraryPath:Array<string>):Promise<ActionResultWithData<Map<string,BaseCalculateNode<any>>>>{
        let result = new ActionResultWithData<Map<string,BaseCalculateNode<any>>>();

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
                result.Result = false;
                result.ErrorData = BaseCalculateError.CREATEERROR(`not found nodeid: ${key} library file`);
                return result;
            }
        }
        result.Data = nodeIDMap as Map<string,BaseCalculateNode<any>>;
        result.Result = true;
        return result;   
    }

    public async createCalculate(treeConfig:CalculateTreeConfig,instanceConfig:CalculateInstanceConfig,libraries:Map<string,BaseCalculateNode<any>>):Promise<ActionResultWithData<BaseCalculateNode<any>>>
    {
        let crateResult = await CalculateFactory.CreateCalculate(this.env,treeConfig,libraries);
        if(crateResult.Result){
            crateResult.Data!.instanceConfig = instanceConfig;
            return crateResult;
        } else {
            return crateResult;
        }
    }

    public async execCalculate<R>(context:any,calculate:BaseCalculateNode<R>):Promise<ActionResultWithData<R>>{
        let result = new ActionResultWithData<R>();
        let calculateNode:BaseCalculateNode<R> = Object.create(calculate);
        calculateNode.context = context;
        try {
            let calculateValue = await calculateNode.calculate();
            result.Data = calculateValue;
            result.Result = true;
        } catch (error) {
            result.ErrorData = error;
            result.Result = false;
        }
        return result;
    }

    private env:any;
}