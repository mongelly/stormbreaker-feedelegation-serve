import { ActionData, ActionResult } from "../../utils/components/actionResult";
import { DateEx } from "../../utils/extensions/dateEx";
import { TxBaseInfo } from "./entities/txBaseInfo.entity";
import * as Devkit from 'thor-devkit';
import { getConnection, getManager, getRepository } from "typeorm";
import { ThorDevKitEx } from "../../utils/extensions/thorDevkitExten";
import { TxClauseBaseInfo } from "./entities/txClauseBaseInfo.entity";

export class TxDelegatorHistoryModel{
    constructor(env:any){
        this.env = env;
    }

    public async selectHistoryByTxid(txid:string):Promise<ActionData<{baseInfo:TxBaseInfo}>>{
        let result = new ActionData<{baseInfo:TxBaseInfo}>();

        try {
            let baseInfo = await getRepository(TxBaseInfo)
            .findOne({where:{txid:txid}})

            if(baseInfo != undefined){
                result.data = {baseInfo:baseInfo};
            }
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`selectHistoryByTxid faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async selectHistroyByFilter(appid:string,filter:TxFilter,includeClause:boolean = false):Promise<ActionData<{history:Array<TxBaseInfo>}>>{
        let result = new ActionData<{history:Array<TxBaseInfo>}>();

        try {
            let connection = getConnection();
            let builder = connection
            .getRepository(TxBaseInfo)
            .createQueryBuilder("tx")
            .innerJoin("tx.clauses","tx_delegation_clauses_index")
            .where("tx.appid = :appid",{appid:appid})
            .andWhere("tx.signts >= :starts",{starts:filter.starts})
            .andWhere("tx.signts <= :endts",{endts:filter.endts});

            if(filter.origins.length > 0){
                builder.andWhere("tx.origin IN (:...origins)",{origins:filter.origins});
            }

            if(filter.delegators.length > 0){
                builder.andWhere("tx.delegator IN (:...delegators)",{delegators:filter.delegators});
            }

            if(filter.toAddresses.length > 0){
                builder.andWhere("tx_delegation_clauses_index.toaddress IN (:...toaddress)",{toaddress:filter.toAddresses});
            }

            builder.orderBy("tx.signts",filter.sort)
            .limit(filter.limit)
            .offset(filter.offset)

            if(includeClause){
                builder.leftJoinAndSelect("tx.clauses","clause")
            }

            let baseinfos = await builder.getMany();

            result.data = {history:baseinfos};
            result.succeed = true;

        } catch (error) {
            result.error = new Error(`selectHistroyByFilter faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async selectHistoryCountByFilter(appid:string,filter:TxFilter):Promise<ActionData<{count:number}>>{
        let result = new ActionData<{count:number}>();

        try {
            let connection = getConnection();
            let builder = await connection
            .getRepository(TxBaseInfo)
            .createQueryBuilder("tx")
            .select("COUNT(tx.txid)","count")
            .innerJoin("tx.clauses","tx_delegation_clauses_index")
            .where("tx.appid = :appid",{appid:appid})
            .andWhere("signts >= :starts",{starts:filter.starts})
            .andWhere("signts <= :endts",{endts:filter.endts});
            
            if(filter.origins.length > 0){
                builder.andWhere("tx.origin IN (:...origins)",{origins:filter.origins});
            }

            if(filter.delegators.length > 0){
                builder.andWhere("tx.delegator IN (:...delegators)",{delegators:filter.delegators});
            }

            if(filter.toAddresses.length > 0){
                builder.andWhere("tx_delegation_clauses_index.toaddress IN (:...toaddress)",{toaddress:filter.toAddresses});
            }

            let { count } = await builder.getRawOne();

            result.data = {count:count};
            result.succeed = true;

        } catch (error) {
            result.error = new Error(`selectHistoryCountByFilter faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async insertTxDelegation(appid:string,txBody:Devkit.Transaction.Body,origin:string,delegator:string):Promise<ActionResult>{
        let result = new ActionResult();

        let txid = ThorDevKitEx.calculateIDWithUnsigned(txBody,origin);
        let baseInfo = new TxBaseInfo();
        baseInfo.txid = txid;
        baseInfo.origin = origin;
        baseInfo.delegator = delegator;
        baseInfo.appid = appid;
        baseInfo.gas = "0x" + BigInt(txBody.gas).toString(16);
        baseInfo.signts = DateEx.getTimeStamp();
        baseInfo.clauses = new Array();

        for(let index = 0; index < txBody.clauses.length;index ++){
            let clause = txBody.clauses[index];
            let clauseInfo = new TxClauseBaseInfo();
            clauseInfo.id = `${baseInfo.txid}_${index}`;
            clauseInfo.clause_index = index;
            clauseInfo.toaddress = clause.to || "";
            clauseInfo.amount = "0x" + BigInt(clause.value).toString(16);
            clauseInfo.data = clause.data;
            baseInfo.clauses.push(clauseInfo);
        }

        try {
            let connection = getConnection();
            await connection.transaction( async tran => {
                await tran.save(baseInfo);
                for(const clause of baseInfo.clauses){
                    await tran.save(clause);
                }
            });
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`insertTxDelegation faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    private env:any;
}

export class TxFilter {
    public origins:Array<string> = new Array();
    public delegators:Array<string> = new Array();
    public toAddresses:Array<string> = new Array();
    public starts:number = DateEx.getTimeStamp(new Date()) - 3600;
    public endts:number = DateEx.getTimeStamp(new Date());
    public limit:number = 50;
    public offset:number = 0;
    public sort:'ASC' | 'DESC' = 'ASC';
}