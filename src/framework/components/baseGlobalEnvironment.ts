import { LogHelper, iLogHelperConfig } from "../helper/logHelper";

export abstract class BaseGlobalEnvironment {
    public config:any;

    constructor(environmentConfig:iBaseConfig | any){
        this.config = environmentConfig;
    }

    public static loadConfigSync(config:any|iBaseConfig,parames:any|undefined,handleFunc:(config:any|iBaseConfig,parames:any|undefined) =>void){
        handleFunc(config,parames);
    }

    public static async loadConfigAsnyc(config:any|iBaseConfig,parames:any|undefined,handleFunc:(config:any|iBaseConfig,parames:any|undefined)=>Promise<any>){
        await handleFunc(config,parames);
    }
}

export interface iBaseConfig{
    env:string;
    serviceName:string;
}

export enum EnvType{
    LOCAL = "local",
    DEV = "dev",
    TEST = "test",
    STAGING = "staging",
    PROD = "prod"
}