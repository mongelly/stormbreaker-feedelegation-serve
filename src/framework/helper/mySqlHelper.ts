import * as mysql from 'mysql';
import { ActionResult, ActionResultWithData} from '../components/actionResult';


export class MysqlHelper
{
    public static async checkConnection(connection:mysql.Connection | mysql.PoolConnection):Promise<ActionResult>
    {
        return new Promise((resolve:(result:ActionResult)=>void) => {
            let result = new ActionResult();
            if(connection){
                connection.ping((err:mysql.MysqlError)=>{
                    if(err){
                        result.Result = false;
                        result.Message = err.message;
                        result.Code = err.code;
                    }
                    else{
                        result.Result = true;
                    }
                    connection.end();
                });
            }
            else{
                result.Result = false;
                result.Code = "";
                result.Message = "connection object is null";
            }
            resolve(result);
        });
    }

    constructor(config:mysql.PoolConfig){
        this._mySqlConfig = config;
        this._mySqlConfig.multipleStatements = true;
        this._mySqlConfig.connectionLimit = 30;
        this._mySqlConfig.queryFormat = function (query:any, values:any) {
            let formaetQuery:string = query;
            if(values){
                let valuesClone = Object.assign({},values);
                let usedKeys:Array<string> = new Array<string>();
                let regex =  /"[^"]+"|\@(\w+)/g;
                formaetQuery = query.replace(regex, function (txt:string, key:string) {
                    if (key && valuesClone.hasOwnProperty(key)) {
                        let value = valuesClone[key];
                        usedKeys.push(key);
                        if(key.match(/SqlStatement.*/))
                        {
                            return " "+value+" ";
                        }
                        return mysql.escape(value);
                    }
                    return txt;
                  }.bind(this));
                  if(usedKeys && usedKeys.length>0){
                    for (let index = 0; index < usedKeys.length; index++) {
                        delete valuesClone[usedKeys[index]];
                    }
                  }
                  formaetQuery = mysql.format(formaetQuery,valuesClone);
            }
            return formaetQuery;
          };
          this._connectionPool = mysql.createPool(this._mySqlConfig);
    }

    public async testConnection():Promise<ActionResult>
    {
        return new Promise((resolve:(result:ActionResult)=>void) => {
            let result = new ActionResult();
            try {
                this._connectionPool.getConnection((err:mysql.MysqlError,connection:mysql.Connection)=>{
                    if(!err){
                        connection.ping((err:mysql.MysqlError)=>{
                            if(!err){
                                result.Result = true;
                                result.Code = "1";
                                result.Message = "MySql connection successful";
                            }
                            else{
                                result.Result = false;
                                result.Result = false;
                                result.Code = "-1";
                                result.Message = "MySql connection faild";
                                result.ErrorData = err;
                            }
                            resolve(result);
                        });
                    }
                    else{
                        result.Result = false;
                        result.Result = false;
                        result.Code = "-1";
                        result.Message = "MySql connection faild";
                        result.ErrorData = err;
                        resolve(result);
                    }
                })
    
            } catch (error) {
                result.Result = false;
                result.Code = "-1";
                result.Message = "MySql connection faild";
                result.ErrorData = error;
                resolve(result);
            }
        });
    }

    public async executeNonQuery(sql:string,params?:any[]|undefined,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{recordCount:number}>>
    {
        let result = new ActionResultWithData<{recordCount:number}>();
        result.Data = {recordCount:0};
        let executeResult:ActionResultWithData<{data:any,fieldInfo:mysql.FieldInfo[]|undefined}>;
        if(connection){
            executeResult = await this.executeNonQueryByConnection(connection,sql,params);
        }
        else{
            executeResult = await this.executeNonQueryByConnectionPool(sql,params);
        }

        if(executeResult.Result){
            if(executeResult.Data!.data.constructor.name == "OkPacket"){
                result.Data!.recordCount = executeResult.Data!.data.affectedRows || 0;
            } else if (executeResult.Data!.data.constructor.name == "Array"){
                result.Data!.recordCount = executeResult.Data!.data.length || 0;
            }
            result.Result = true;
        }
        else{
            result.copyBase(executeResult);
        }
        return result;
    }

    public async executeQuery(sql:string,params?:any[]|undefined,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{records:Array<any>,fieldInfo:mysql.FieldInfo[]|undefined}>>
    {
        let result = new ActionResultWithData<{records:Array<any>,fieldInfo:mysql.FieldInfo[]|undefined}>();
        let executeResult:ActionResultWithData<{data:any,fieldInfo:mysql.FieldInfo[] | undefined}>;
        if(connection){
            executeResult = await this.executeNonQueryByConnection(connection,sql,params);
        }
        else{
            executeResult = await this.executeNonQueryByConnectionPool(sql,params);
        }

        if(executeResult.Result){
            if(executeResult.Data!.data.constructor.name != "Array"){
                result.Data = {records:new Array<any>(),fieldInfo:executeResult.Data!.fieldInfo};
            }
            else if(executeResult.Data!.data.constructor.name == "Array"){
                let resultDataArray = new Array<any>();
                let dbResultArray = executeResult.Data!.data as Array<any>;
                for (let index = 0; index < dbResultArray.length; index++) {
                    let element = dbResultArray[index];
                    if(element.constructor.name == "RowDataPacket"){
                        resultDataArray.push(dbResultArray);
                        break;
                    }else if (element.constructor.name == "Array"){
                        resultDataArray.push(element as Array<any>);
                        continue;
                    }
                }
                if(resultDataArray.length==1){
                    result.Data = {records:resultDataArray[0],fieldInfo:executeResult.Data!.fieldInfo};
                }else if(resultDataArray.length>1){
                    result.Data = {records:resultDataArray,fieldInfo:executeResult.Data!.fieldInfo};
                }
            }
            result.Result = true;
        }
        else{
            result.copyBase(executeResult);
        }
        return result;
    }

    public async batchExecute(sql:string,paramsArray:Array<any>):Promise<ActionResult>
    {
        let result = new ActionResult();
        const BATCHNUMBER:number = 100;
        let batchParames:Array<Array<any>> = new Array<Array<any>>();
        if(paramsArray && paramsArray.length>0)
        {
            let params = new Array<any>();
            for (let index = 0; index < paramsArray.length; index++) {
                params.push(paramsArray[index]);
                if(params.length == BATCHNUMBER || index == paramsArray.length - 1){
                    batchParames.push(params);
                    params = new Array<any>();
                    continue;
                }
            }

            if(batchParames && batchParames.length>0){
                for(let parames of batchParames){
                    let batchSQL:string = "";
                    let getTransactionConnectionResult = await this.beginTransaction();
                    if(!getTransactionConnectionResult.Result){
                        result.copyBase(getTransactionConnectionResult);
                        return result;
                    }
                    let connection = getTransactionConnectionResult.Data!.connection;

                    for(let param of parames){
                        batchSQL += connection.format(sql,param) + "\r\n";
                    }
                    let dbResult = await this.executeNonQuery(batchSQL,undefined,connection);
                    if(dbResult.Result){
                        let commitResult = await this.commitTransaction(connection,true);
                        if(commitResult.Result){
                            result.Result = true;
                        }
                        else{
                            result.copyBase(commitResult);
                            console.error("DB Error",JSON.stringify(dbResult.ErrorData));
                            break;
                        }
                    }
                    else{
                        console.error("DB Error",JSON.stringify(dbResult.ErrorData));
                        result.copyBase(dbResult);
                        break;
                    }
                    batchSQL = "";
                }
            }
        }
        else{
            result.Result = false;
        }
        return result;
    }
     
    public async getNewConnectionFromPool():Promise<ActionResultWithData<mysql.PoolConnection>>{
        return new Promise((resolve:(result:ActionResultWithData<mysql.PoolConnection>)=>void) => {
            this._connectionPool.getConnection((err:mysql.MysqlError,connection:mysql.PoolConnection)=>{
                let result = new ActionResultWithData<mysql.PoolConnection>();
                if(!err){
                    result.Data = connection;
                    result.Result = true;
                }
                else{
                    result.Result = false;
                    result.Code = err.code;
                    result.Message = err.message;
                    result.ErrorData = err;
                }
                resolve(result);
            });
        });
    }

    public async beginTransaction():Promise<ActionResultWithData<{connection:mysql.PoolConnection}>>
    {
        return new Promise((resolve:(result:ActionResultWithData<{connection:mysql.PoolConnection}>)=>void) => {
            this._connectionPool.getConnection((err:mysql.MysqlError,connection:mysql.PoolConnection)=>{
                let result = new ActionResultWithData<{connection:mysql.PoolConnection}>();
                if(!err){
                    connection.beginTransaction((err:mysql.MysqlError)=>{
                        if(!err){
                            result.Data = {connection:connection};
                            result.Result = true;
                        }
                        else{
                            result.Result = false;
                            result.Code = err.code;
                            result.Message = err.message;
                            result.ErrorData = err;
                        }
                        resolve(result);
                    });
                    
                }
                else{
                    result.Result = false;
                    result.Code = err.code;
                    result.Message = err.message;
                    resolve(result);
                }
            });
        });
    }

    public async commitTransaction(connection:mysql.PoolConnection,autoRelease:boolean=true):Promise<ActionResult>{
        return new Promise((resolve:(result:ActionResult)=>void) => {
            let result = new ActionResult();
            if(connection){
                connection.commit((err:mysql.MysqlError)=>{
                    if(!err){
                        result.Result = true;
                        if(autoRelease){
                            connection.release();
                        }
                    }
                    else{
                        result.Result = false;
                        result.Code = err.code;
                        result.Message = err.message;
                        result.ErrorData = err;
                        connection.rollback(()=>{});
                    }
                    resolve(result);
                });
            }
            else{
                result.Result = false;
                result.Code = "";
                result.Message = "connection is null";
                resolve(result);
            }
        });
    }

    public async rollbackTransaction(connection:mysql.PoolConnection,autoRelease:boolean=true):Promise<ActionResult>{
        return new Promise((resolve:(result:ActionResult)=>void) => {
            let result = new ActionResult();
            if(connection){
                connection.rollback(()=>{});
                result.Result = true;
                if(autoRelease){
                    connection.release();
                }
            }
            else{
                result.Result = false;
                result.Code = "";
                result.Message = "connection is null";
                resolve(result);
            }
        });
    }

    public convertArrayToSqlStatement(arr:any[]):string
    {
        let resultStr = "";
        if(arr && arr.length>0)
        {
            for (let index = 0; index < arr.length; index++) {
                if(arr[index] && arr[index].length>0)
                {
                    resultStr += mysql.escape(arr[index]);
                    if(index != arr.length-1){
                        resultStr += ",";
                    }
                }
            }
            resultStr = resultStr.length>0?"("+resultStr+")":"";
        }
        return resultStr;
    }

    private _connectionPool:mysql.Pool;
    private _mySqlConfig:mysql.PoolConfig;

    private async executeNonQueryByConnection(connection:mysql.PoolConnection,sql:string,params?:any[]|undefined,):Promise<ActionResultWithData<{data:any,fieldInfo:mysql.FieldInfo[] | undefined}>>
    {
        return new Promise((resolve:(result:ActionResultWithData<{data:any,fieldInfo:mysql.FieldInfo[] | undefined}>)=>void) => {
            connection.query(sql,params,(err:mysql.MysqlError | null,dbresult?:any,fields?:mysql.FieldInfo[])=>{
                let result = new ActionResultWithData<{data:any,fieldInfo:mysql.FieldInfo[] | undefined}>();
                if(!err){
                    result.Data = {data:dbresult,fieldInfo:fields};
                    result.Result = true;
                }
                else{
                    result.Result = false;
                    result.Message = err.message;
                    result.Code = err.code;
                    result.ErrorData = err;
                }
                resolve(result);
            });
        });
    }
    private async executeNonQueryByConnectionPool(sql: string, params?: any[] | null): Promise<ActionResultWithData<{data:any,fieldInfo:mysql.FieldInfo[] | undefined}>> {
        return new Promise((resolve: (result: ActionResultWithData<{data:any,fieldInfo:mysql.FieldInfo[] | undefined}>) => void) => {
            this._connectionPool.getConnection((err: mysql.MysqlError, connection: mysql.PoolConnection) => {
                if(!err){
                    connection.query(sql, params, (err: mysql.MysqlError | null, dbresult?: any, fields?: mysql.FieldInfo[]) => {
                        let result = new ActionResultWithData<{data:any,fieldInfo:mysql.FieldInfo[] | undefined}>();
                        connection.release();
                        if (!err) {
                            result.Data = {data:dbresult,fieldInfo:fields};
                            result.Result = true;
                        }
                        else {
                            result.Result = false;
                            result.Message = err.message;
                            result.Code = err.code;
                            result.ErrorData = err;
                        }
                        resolve(result);
                    });
                }
                else{
                    let result = new ActionResultWithData<{data:any,fieldInfo:mysql.FieldInfo[] | undefined}>();
                    result.Result = false;
                    result.Message = err.message;
                    result.Code = err.code;
                    result.ErrorData = err;
                    resolve(result);
                }
            });
        });
    }
}