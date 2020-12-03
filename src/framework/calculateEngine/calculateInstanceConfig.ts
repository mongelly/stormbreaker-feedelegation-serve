export interface CalculateInstanceConfig{
    instanceid:string,
    configs:CalculateInstanceConfigDefine[]
}

export interface CalculateInstanceConfigDefine{
    instanceid:string;
    config:any
}