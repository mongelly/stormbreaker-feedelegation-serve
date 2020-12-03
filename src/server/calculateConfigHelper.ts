import { ActionResult,ActionResultWithData } from "../framework/components/actionResult";
import { MysqlHelper } from "../framework/helper/mySqlHelper";
import { BaseCalculateNode } from "../framework/calculateEngine/baseCalculateNode";
import * as mysql from 'mysql';
import {v4 as uuid} from 'uuid';
import { CalculateTreeConfig } from "../framework/calculateEngine/calculateTreeConfig";
import { CalculateInstanceConfig } from "../framework/calculateEngine/calculateInstanceConfig";
import Joi from "joi";
import { join } from "path";

export default class CalculateConfigHelper{

    constructor(env:any){
        this.env = env;
        this.mySqlHelper = this.env.mySqlHelper;
    }

    public async getCalculateTreeConfig(appid:string,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{configid:string,treeNodeConfig:CalculateTreeConfig}>>{
        let result = new ActionResultWithData<{configid:string,treeNodeConfig:CalculateTreeConfig}>();
        
        let sql:string = `SELECT a.configid AS configid,a.appid AS appid,b.config AS config
        FROM calculate_tree_config a,calculate_tree_config_json b
        WHERE a.configid = b.configid and a.appid = @appid and a.valid = 1;`;
        let parames:any = {appid:appid};

        let dbResult = await this.mySqlHelper.executeQuery(sql,parames,connection);
        if(dbResult.Result && dbResult.Data){
            if(dbResult.Data!.records.length == 1){
                let row = dbResult.Data!.records[0];
                result.Data = {
                    configid:row["configid"] as string,
                    treeNodeConfig:JSON.parse(row["config"])
                };
                result.Result = true;
            }
            result.Result = true;
        } else {
            result.copyBase(dbResult);
        }
        return result;
    }

    public async insertCalculateTreeConfig(appid:string,config:CalculateTreeConfig,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{configid:string}>>{
        let result = new ActionResultWithData<{configid:string}>();

        let sql:string = `INSERT INTO calculate_tree_config
        (configid,appid,createts,updatets,valid)
        SELECT
        @configid,@appid,UNIX_TIMESTAMP(now()),UNIX_TIMESTAMP(now()),1
        FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM calculate_tree_config a WHERE a.configid = @configid);

        INSERT INTO calculate_tree_config_json
        (configid,config)
        SELECT
        @configid,@config
        FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM calculate_tree_config_json a WHERE a.configid = @configid);`;
        let configid = uuid();
        config.configid = configid;
        let parames:any = {
            configid:configid,
            appid:appid,
            config:JSON.stringify(config),
        }
        let dbResult = await this.mySqlHelper.executeNonQuery(sql,parames,connection);
        if(dbResult.Result){
            result.Data = {configid:parames.configid}
            result.Result = true;
        } else {
            result.copyBase(dbResult);
        }

        return result;
    }

    public async updateCalculateTreeConfig(appid:string,config:CalculateTreeConfig,connection?:mysql.PoolConnection|undefined):Promise<ActionResult>{

        let sql:string = `UPDATE calculate_tree_config
        set updatets = UNIX_TIMESTAMP(now())
        WHERE appid = @appid;
        
        UPDATE calculate_tree_config_json a
            INNER JOIN calculate_tree_config b
                ON a.configid = b.configid
        set a.config = @config
        WHERE b.appid = @appid`;

        let parames:any = {
            appid:appid,
            config:JSON.stringify(config)
        }

        return await this.mySqlHelper.executeNonQuery(sql,parames,connection);
    }

    public async removeCalculateTreeConfig(appid:string,connection?:mysql.PoolConnection|undefined):Promise<ActionResult>{
        let sql:string = `UPDATE calculate_tree_config
            set valid = 0
            where appid = @appid;`;
        let parames:any = {
            appid:appid
        }

        return await this.mySqlHelper.executeNonQuery(sql,parames,connection);
    }

    public async getCalculateInstanceConfig(appid:string,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{instanceid:string,instanceConfig:CalculateInstanceConfig}>>{
        let result = new ActionResultWithData<{instanceid:string,instanceConfig:CalculateInstanceConfig}>();

        let sql:string = `SELECT a.instanceid AS instanceid,a.appid AS appid,b.config as config
        FROM calculate_instance_config a,calculate_instance_config_json b
        WHERE a.instanceid = b.instanceid AND a.appid = @appid and a.valid = 1;`;

        let parames:any = {appid:appid}

        let dbResult = await this.mySqlHelper.executeQuery(sql,parames,connection);
        if(dbResult.Result && dbResult.Data){
            if(dbResult.Data.records.length > 0){
                let row = dbResult.Data.records[0];
                result.Data = {
                    instanceid:row["instanceid"] as string,
                    instanceConfig:JSON.parse(row["config"])
                };
            }
            result.Result = true;
        } else {
            result.copyBase(result);
        }

        return result;
    }

    public async insertCalculateInstanceConfig(appid:string,config:CalculateInstanceConfig,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{instanceid:string}>>{
        let result = new ActionResultWithData<{instanceid:string}>();

        let sql:string = `INSERT INTO calculate_instance_config
        (instanceid,appid,createts,updatets,valid)
        SELECT
        @instanceid,@appid,UNIX_TIMESTAMP(now()),UNIX_TIMESTAMP(now()),1
        FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM calculate_instance_config a WHERE a.instanceid = @instanceid);
        
        INSERT INTO calculate_instance_config_json
        (instanceid,config)
        SELECT
        @instanceid,@config
        FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM calculate_instance_config_json a WHERE a.instanceid = @instanceid);`;
        config.instanceid = uuid();
        let parames:any = {
            instanceid:config.instanceid,
            appid:appid,
            config:JSON.stringify(config)
        }

        let dbResult = await this.mySqlHelper.executeNonQuery(sql,parames,connection);
        if(dbResult.Result){
            result.Data = {instanceid:parames.instanceid}
            result.Result = true;
        } else {
            result.copyBase(dbResult);
        }
        return result;
    }

    public async updateCalculateInstanceConfig(appid:string,config:CalculateInstanceConfig,connection?:mysql.PoolConnection|undefined):Promise<ActionResult>{
        let sql:string = `UPDATE calculate_instance_config
        set updatets = UNIX_TIMESTAMP(now())
        WHERE appid = @appid;
        
        UPDATE calculate_instance_config_json a
            INNER JOIN calculate_instance_config b
                ON a.instanceid = b.instanceid
        set a.config = @config
        WHERE b.appid = @appid`;

        let parames:any = {
            appid:appid,
            config:JSON.stringify(config)
        }

        return await this.mySqlHelper.executeNonQuery(sql,parames,connection);
    }

    public async removeCalculateInstanceConfig(appid:string,connection?:mysql.PoolConnection|undefined):Promise<ActionResult>{
        let sql:string = `UPDATE calculate_instance_config
            set valid = 0
            where appid = @appid;`;
        let parames:any = {
            appid:appid
        }

        return await this.mySqlHelper.executeNonQuery(sql,parames,connection);
    }

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

    private env:any;
    private mySqlHelper:MysqlHelper;
}