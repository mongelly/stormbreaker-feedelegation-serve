import { ActionResult, ActionResultWithData } from "../framework/components/actionResult";
import { MysqlHelper } from "../framework/helper/mySqlHelper";
import {v4 as uuid} from 'uuid';
import * as mysql from 'mysql';

export default class AuthorizationManager{

    constructor(env:any){
        this.env = env;
        this.mySqlHelper = this.env.mySqlHelper;
    }

    public async registered(connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{appid:string}>>{
        let result = new ActionResultWithData<{appid:string}>();

        let sql:string = `INSERT INTO authorization_info
        (appid,createts,valid)
        SELECT
        @appid,UNIX_TIMESTAMP(now()),1
        FROM DUAL;`

        let parames:any = {
            appid:uuid()
        }

        let dbResult = await this.mySqlHelper.executeNonQuery(sql,parames,connection);
        if(dbResult.Result){
            result.Data = {appid:parames.appid};
            result.Result = true;
        } else {
            result.copyBase(result);
        }

        return result;
    }

    public async getAuthorizationInfo(appid:string,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{appid:string,createts:number}>>{
        let result = new ActionResultWithData<{appid:string,createts:number}>();

        let sql:string = `SELECT 
        appid AS appid,createts AS createts
        FROM authorization_info
        WHERE appid = @appid and valid = 1;`

        let parames:any = {appid:appid};

        let dbResult = await this.mySqlHelper.executeQuery(sql,parames,connection);
        if(dbResult.Result){
            if(dbResult.Data && dbResult.Data.records[0]){
                result.Data = {
                    appid:appid,
                    createts:dbResult.Data.records[0]["createts"] as number}
            }
            result.Result = true;
        } else {
            result.copyBase(dbResult);
        }
        
        return result;
    }

    public async removeAuthorizationInfo(appid:string,connection?:mysql.PoolConnection|undefined):Promise<ActionResult>{

        let sql:string = `UPDATE authorization_info
        SET valid = 0
        WHERE appid = @appid;`;

        let parames:any = {appid:appid};

        return await this.mySqlHelper.executeNonQuery(sql,parames,connection);
    }

    private env:any;
    private mySqlHelper:MysqlHelper;
}