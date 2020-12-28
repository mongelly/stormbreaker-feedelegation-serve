export interface ICalculateInstanceConfig{
    instanceid:string,
    configs:ICalculateInstanceConfigDefine[]
}

export interface ICalculateInstanceConfigDefine{
    instanceid:string;
    config:any
}