import { ActionData, ActionResult } from "../../utils/components/actionResult";
import { DateEx } from "../../utils/extensions/dateEx";
import { TxBaseInfo } from "./entities/txBaseInfo.entity";
import * as Devkit from 'thor-devkit';
import { getConnection } from "typeorm";
import { ThorDevKitEx } from "../../utils/extensions/thorDevkitExten";
import { TxClauseBaseInfo } from "./entities/txClauseBaseInfo.entity";

export class TxDelegatorHistoryModel{
    constructor(env:any){
        this.env = env;
    }

    public async selectHistoryByTxid(txid:string):Promise<ActionData<{baseInfo:TxBaseInfo}>>{
        let result = new ActionData<{baseInfo:TxBaseInfo}>();

        try {
            let connection = getConnection();
            let baseInfo = await connection
            .getRepository(TxBaseInfo)
            .createQueryBuilder("tx")
            .where("tx.txid = :txid",{txid:txid.toLowerCase()})
            .leftJoinAndSelect("tx.clauses","clause")
            .getOne();
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

    public async selectHistoryByOriginAndSignTs(origin:string,starts:number,endts:number = DateEx.getTimeStamp(new Date()),includeClause:boolean = false,offset:number = 0,limit:number = 50):Promise<ActionData<{history:Array<TxBaseInfo>}>>{
        let result = new ActionData<{history:Array<TxBaseInfo>}>()

        try {
            let connection = getConnection();
            let builder = connection
            .getRepository(TxBaseInfo)
            .createQueryBuilder("tx")
            .where("tx.origin = :origin",{origin:origin.toLowerCase()})
            .andWhere("tx.signts >= :starts",{starts:starts})
            .andWhere("tx.signts <= :endts",{endts:endts})
            .orderBy("tx.signts","DESC")
            .limit(limit)
            .offset(offset)

            if(includeClause){
                builder.leftJoinAndSelect("tx.clauses","clause")
            }

            let baseinfos = await builder.getMany();

            result.data = {history:baseinfos};
            result.succeed = true;

        } catch (error) {
            result.error = new Error(`selectHistoryByOriginAndSignTs faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async selectHistroyCountByOriginAndSignTs(origin:string,starts:number,endts:number = DateEx.getTimeStamp(new Date())):Promise<ActionData<{count:number}>>{
        let result = new ActionData<{count:number}>();

        try {
            let connection = getConnection();
            let { count } = await connection
            .getRepository(TxBaseInfo)
            .createQueryBuilder()
            .select("COUNT(txid)","count")
            .where("origin = :origin",{origin:origin.toLowerCase()})
            .andWhere("signts >= :starts",{starts:starts})
            .andWhere("signts <= :endts",{endts:endts})
            .getRawOne();

            if(count == undefined){
                count = 0;
            }
            result.data = {count:parseInt(count)};
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`selectHistroyCountByOriginAndSignTs faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async insertTxDelegation(txBody:Devkit.Transaction.Body,origin:string,delegator:string):Promise<ActionResult>{
        let result = new ActionResult();

        let txid = ThorDevKitEx.calculateIDWithUnsigned(txBody,origin);
        let baseInfo = new TxBaseInfo();
        baseInfo.txid = txid;
        baseInfo.origin = origin;
        baseInfo.delegator = delegator;
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