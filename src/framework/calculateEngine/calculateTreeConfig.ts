export interface CalculateTreeConfig{
    configid:string;
    name:string;
    root:CalculateTreeNodeDefine;
    references:CalculateTreeNodeDefine[]
}

export interface CalculateTreeNodeDefine{
    instanceid:string;
    nodeid:string;
    node:string;
    inputs:CalculateSubNode[]
}

export interface CalculateSubNode{
    type:string;
    value:string;
}