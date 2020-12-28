export interface ICalculateTreeConfig{
    configid:string;
    name:string;
    root:ICalculateTreeNodeDefine;
    references:ICalculateTreeNodeDefine[]
}

export interface ICalculateTreeNodeDefine{
    instanceid:string;
    nodeid:string;
    node:string;
    inputs:ICalculateSubNode[]
}

export interface ICalculateSubNode{
    type:string;
    value:string;
}