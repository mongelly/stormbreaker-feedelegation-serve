import Joi from "joi";

export class CalculateConfigHelper{
    public static verifyCalculateTreeConfigSchema(config:any):boolean{
        let calculateSubNodeVerifySchema = Joi.object({
            type:Joi.string().max(50).required(),
            value:Joi.string().max(1000).required()
        });
        let calculateTreeNodeDefineVerifySchema = Joi.object({
            instanceid:Joi.string().max(50).required(),
            nodeid:Joi.string().max(50).required(),
            node:Joi.string().max(100),
            inputs:Joi.array().items(calculateSubNodeVerifySchema)
        });
        let calculateTreeConfigVerifySchema = Joi.object({
            name:Joi.string().max(100),
            root:calculateTreeNodeDefineVerifySchema.required(),
            references:Joi.array().items(calculateTreeNodeDefineVerifySchema)
        });

        let verify = calculateTreeConfigVerifySchema.validate(config,{allowUnknown:true});
        if(verify.error || verify.errors){
            return false;
        } 
        return true;
    }

    public static verifyCalculateInstanceConfigSchema(config:any):boolean{
        let CalculateInstanceConfigDefineSchema = Joi.object({
            instanceid:Joi.string().max(50).required(),
            config:Joi.object()
        });

        let CalculateInstanceConfigSchema = Joi.object({
            configs:Joi.array().items(CalculateInstanceConfigDefineSchema)
        });

        let verifyResult = CalculateInstanceConfigSchema.validate(config,{allowUnknown:true});
        if(verifyResult.error || verifyResult.errors){
            return false;
        } 
        return true;
    }
}