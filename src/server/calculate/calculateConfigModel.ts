import { ActionData, ActionResult } from "../../utils/components/actionResult";
import { CalculateTreeConfigEntity } from "./entities/calculateTreeConfig.entity";
import {v4 as uuid} from 'uuid';
import { DateEx } from "../../utils/extensions/dateEx";
import { getConnection, getManager } from "typeorm";
import { CalculateInstanceConfigEntity } from "./entities/calculateInstanceConfig.entity";
import { TreeConfig } from "../../utils/calculateEngine/src/calculateEngine/treeConfig";
import { InstanceConfig } from "../../utils/calculateEngine/src/calculateEngine/instanceConfig";

export default class CalculateConfigModel{

    constructor(env:any){
        this.env = env;
    }

    public async getCalculateTreeConfig(appid:string):Promise<ActionData<{configid:string,treeNodeConfig:TreeConfig}>>{
        let result = new ActionData<{configid:string,treeNodeConfig:TreeConfig}>();

        try {
            let connection = getConnection();
            let data = await connection
            .getRepository(CalculateTreeConfigEntity)
            .createQueryBuilder()
            .where("appid = :appid",{appid:appid})
            .andWhere("valid = 1")
            .getOne();

            if(data != undefined){
                result.data = {configid:data.configid,treeNodeConfig:data.config}
            }
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`getCalculateTreeConfig faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async saveCalculateTreeConfig(appid:string,treeconfig:TreeConfig):Promise<ActionData<{configid:string}>>{
        let result = new ActionData<{configid:string}>();

        let config = new CalculateTreeConfigEntity();
        config.configid = uuid();
        config.appid = appid;
        config.createts = DateEx.getTimeStamp();
        config.updatets = config.createts;
        config.config = treeconfig;
        config.valid = true;

        try {
            await getManager()
            .save(config);
            result.data = {configid:config.configid}
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`saveCalculateTreeConfig faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async removeCalculateTreeConfig(appid:string):Promise<ActionResult>{
        let result = new ActionResult();

        try {
            let connection = getConnection();
            await connection
            .createQueryBuilder()
            .update(CalculateTreeConfigEntity)
            .set({valid:false})
            .where("appid = :appid",{appid:appid})
            .execute()
        } catch (error) {
            result.error = new Error(`removeCalculateTreeConfig faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async getCalculateInstanceConfig(appid:string):Promise<ActionData<{instanceid:string,instanceConfig:InstanceConfig}>>{
        let result = new ActionData<{instanceid:string,instanceConfig:InstanceConfig}>();

        try {
            let connection = getConnection();
            let data = await connection
            .getRepository(CalculateInstanceConfigEntity)
            .createQueryBuilder()
            .where("appid = :appid",{appid:appid})
            .andWhere("valid = 1")
            .getOne()

            if(data != undefined){
                result.data = {instanceid:data.instanceid,instanceConfig:data.config}
            }
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`getCalculateInstanceConfig faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async saveCalculateInstanceConfig(appid:string,instaceConfig:InstanceConfig):Promise<ActionData<{instanceid:string}>>{
        let result = new ActionData<{instanceid:string}>();

        let config = new CalculateInstanceConfigEntity();
        config.instanceid = uuid();
        config.appid = appid;
        config.createts = DateEx.getTimeStamp();
        config.updatets = config.createts;
        config.config = instaceConfig;
        config.valid = true;

        try {
            await getManager()
            .save(config);
            result.data = {instanceid:config.instanceid}
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`saveCalculateInstanceConfig faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async removeCalculateInstanceConfig(appid:string):Promise<ActionResult>{
        let result = new ActionResult();

        try {
            let connection = getConnection();
            await connection
            .createQueryBuilder()
            .update(CalculateInstanceConfigEntity)
            .set({valid:false})
            .where("appid = :appid",{appid:appid})
            .execute()
        } catch (error) {
            result.error = new Error(`removeCalculateInstanceConfig faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    private env:any;
}