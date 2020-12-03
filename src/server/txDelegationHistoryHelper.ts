import { MysqlHelper } from "../framework/helper/mySqlHelper";
import * as Devkit from 'thor-devkit'
import { ActionResult, ActionResultWithData } from "../framework/components/actionResult";
import PromiseWithActionResultEx from "../framework/components/promiseWithActionResultEx";
import { TxBaseInfo, TxClauseBaseInfo } from "./types/txBaseInfo";
import * as mysql from 'mysql';
import { BigNumberEx } from "../framework/helper/bigNumberEx";
import DevkitExtension from "../framework/helper/devkitExtension";
import DateHelper from "../framework/helper/dateHelper";

export class TxDelegationHistoryHelper{
    
    constructor(env:any){
        this.env = env;
        this.mySqlHelper = this.env.mySqlHelper;
    }

    public async selectHistoryByID(txid:string,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{baseInfo:TxBaseInfo}>>{
        let result =new ActionResultWithData<{baseInfo:TxBaseInfo}>();

        let sql:string = `SELECT txid,origin,delegator,gas,signts
        FROM tx_delegation
        WHERE txid = @txid;
        
        SELECT txid,clause_index,toaddress,amount,data
        FROM tx_delegation_clauses_index
        WHERE txid = @txid;
        `;

        let parame:any = {
            txid:txid
        }

        let dbResult = await this.mySqlHelper.executeQuery(sql,parame,connection);
        if(dbResult.Result && dbResult.Data?.records && dbResult.Data.records.length == 2){
            if((dbResult.Data.records[0] as Array<any>).length > 0){
                let row1 = dbResult.Data!.records[0][0];
                let txBaseInfo = new TxBaseInfo();
                txBaseInfo.txid = row1["txid"] as string;
                txBaseInfo.origin = row1["origin"] as string;
                txBaseInfo.delegator = row1["delegator"] as string;
                txBaseInfo.gas = new BigNumberEx(row1["gas"]);
                txBaseInfo.signTs = row1["signts"] as number;
                txBaseInfo.clauses = new Array();
    
                for(const row of dbResult.Data!.records[1]){
                    let clause = new TxClauseBaseInfo();
                    clause.clauseIndex = row["clause_index"] as number;
                    clause.toaddress = row["toaddress"] as string;
                    clause.amount = new BigNumberEx(row["amount"]);
                    clause.data = "0x" + Buffer.from(row["data"]).toString();
                    txBaseInfo.clauses.push(clause);
                }
                result.Data = {baseInfo:txBaseInfo};
            }
            result.Result = true;
        } else {
            result.copyBase(dbResult);
        }

        return result;
    }

    public async selectHistoryByOriginAndSignTs(origin:string,starts:number,endts:number = DateHelper.getTimeStamp(new Date()),offset:number = 0,limit:number = 50,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{history:Array<TxBaseInfo>}>>{
        let result = new ActionResultWithData<{history:Array<TxBaseInfo>}>();

        let sql = `
        DROP TEMPORARY TABLE IF EXISTS temp_tx_history;
        CREATE TEMPORARY TABLE temp_tx_history(
            txid	VARCHAR(66),
            origin VARCHAR(42),
            delegator VARCHAR(42),
            gas BIGINT UNSIGNED,
            signts BIGINT UNSIGNED
        );
        
        INSERT INTO temp_tx_history
        (txid,origin,delegator,gas,signts)
        SELECT txid,origin,delegator,gas,signts
        FROM tx_delegation
        WHERE origin = @origin AND signts >= @starts AND signts <= @endts
        ORDER BY signts DESC
        LIMIT @limitvalue OFFSET @offsetvalue;
        
        SELECT 
        txid,origin,delegator,gas,signts
        FROM
        temp_tx_history;
        
        SELECT a.txid,a.clause_index,a.toaddress,a.amount,a.data
        FROM tx_delegation_clauses_index a,temp_tx_history b
        WHERE a.txid = b.txid;`;

        let parame:any = {
            origin:origin,
            starts:starts,
            endts:endts,
            offsetvalue:offset,
            limitvalue:limit,
        }

        let dbResult = await this.mySqlHelper.executeQuery(sql,parame,connection);
        if(dbResult.Result && dbResult.Data?.records && dbResult.Data.records.length == 2){
            result.Data = {history:new Array<TxBaseInfo>()};
            for(const row1 of dbResult.Data.records[0]){
                let txBaseInfo = new TxBaseInfo();
                txBaseInfo.txid = row1["txid"] as string;
                txBaseInfo.origin = row1["origin"] as string;
                txBaseInfo.delegator = row1["delegator"] as string;
                txBaseInfo.gas = new BigNumberEx(row1["gas"]);
                txBaseInfo.signTs = row1["signts"] as number;
                txBaseInfo.clauses = new Array();

                let clausesRows = (dbResult.Data.records[1] as Array<any>).filter(row2 => { return row2["txid"] == txBaseInfo.txid});
                for(const clauseRow of clausesRows){
                    let clause = new TxClauseBaseInfo();
                    clause.clauseIndex = clauseRow["clause_index"] as number;
                    clause.toaddress = clauseRow["toaddress"] as string;
                    clause.amount = new BigNumberEx(clauseRow["amount"]);
                    clause.data = "0x" + Buffer.from(clauseRow["data"]).toString();
                    txBaseInfo.clauses.push(clause);
                }
                result.Data.history.push(txBaseInfo);
            }

            result.Result = true;
        } else {
            result.copyBase(dbResult);
        }
        return result;
    }

    public async selectHistroyCountByOriginAndSignTs(origin:string,starts:number,endts:number,connection?:mysql.PoolConnection|undefined):Promise<ActionResultWithData<{count:number}>>{
        let result = new ActionResultWithData<{count:number}>();

        let sql = `
        SELECT COUNT(*) as count
        FROM tx_delegation
        WHERE origin = @origin AND signts >= @starts AND signts <= @endts`;

        let parame:any = {
            origin:origin,
            starts:starts,
            endts:endts
        }

        let dbResult = await this.mySqlHelper.executeQuery(sql,parame,connection);
        if(dbResult.Result && dbResult.Data?.records && dbResult.Data.records.length == 1){
            result.Data = {count:dbResult.Data.records[0]["count"] as number};
            result.Result = true;
        } else {
            result.copyBase(dbResult);
        }

        return result;
    }

    public async insertTxDelegation(txBody:Devkit.Transaction.Body,origin:string,delegator:string):Promise<ActionResult>{
        let result = new ActionResult();

        let sql1:string = `INSERT INTO tx_delegation
        (txid,origin,delegator,gas,signts)
        SELECT
        @txid,@origin,@delegator,@gas,UNIX_TIMESTAMP(now())
        FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM tx_delegation a WHERE a.txid = @txid);`;

        let sql2:string = `INSERT INTO tx_delegation_clauses_index
        (txid,clause_index,toaddress,amount,data)
        SELECT
        @txid,@clauseindex,@toaddress,@amount,@data
        FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM tx_delegation_clauses_index a WHERE a.txid = @txid);`;

        let txid = DevkitExtension.calculateIDWithUnsigned(txBody,origin);

        let beginTransResult = await this.mySqlHelper.beginTransaction();
        let promises = Array<Promise<any>>();
        if(beginTransResult.Result && beginTransResult.Data?.connection){
            let parames1:any = {
                txid:txid,
                origin:origin,
                delegator:delegator,
                gas:txBody.gas
            }
            let sql1ExecPromise = this.mySqlHelper.executeNonQuery(sql1,parames1,beginTransResult.Data.connection);
            promises.push(sql1ExecPromise);
            for(let index = 0; index < txBody.clauses.length; index++){
                let clause = txBody.clauses[index];
                let parames2:any = {
                    txid:txid,
                    clauseindex:index,
                    toaddress:clause.to,
                    amount:(new BigNumberEx(clause.value)).toString(),
                    data:Buffer.from(clause.data)
                }
                let sql2ExecPromise = this.mySqlHelper.executeNonQuery(sql2,parames2,beginTransResult.Data.connection);
                promises.push(sql2ExecPromise);
            }
            let execResult = await PromiseWithActionResultEx.ReturnActionResult(Promise.all(promises));
            if(execResult.Result){
                result = await this.mySqlHelper.commitTransaction(beginTransResult.Data.connection);
            } else {
                this.mySqlHelper.rollbackTransaction(beginTransResult.Data.connection,true);
                result.copyBase(execResult.Data!.failed[0]);
            }
        } else {
            result.copyBase(beginTransResult);
        }

        return result;
    }

    private env:any;
    private mySqlHelper:MysqlHelper;
}