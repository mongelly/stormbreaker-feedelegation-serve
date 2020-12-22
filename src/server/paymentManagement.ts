import * as mysql from 'mysql';
import { ActionResultWithData } from '../framework/components/actionResult';
import { MysqlHelper } from '../framework/helper/mySqlHelper';

export default class PaymentManagement{
    constructor(env:any){
        this.env = env;
        this.mySqlHelper = this.env.mySqlHelper;
    }

    public async getDelegator(appid:string,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{delegator:string}>>{
        let result = new ActionResultWithData<{delegator:string}>();

        let sql:string = `SELECT 
        appid AS appid,delegator as delegator
        FROM delegator_config
        WHERE appid = @appid`;

        let parames:any = {appid:appid};
        let dbResult = await this.mySqlHelper.executeQuery(sql,parames,connection);
        if(dbResult.Result){
            if(dbResult.Data && dbResult.Data.records[0]){
                result.Data = {delegator:dbResult.Data.records[0]["delegator"] as string};
            }
            result.Result = true
        } else {
            result.copyBase(dbResult);
        }

        return result;
    }

    private env:any;
    private mySqlHelper:MysqlHelper;
}