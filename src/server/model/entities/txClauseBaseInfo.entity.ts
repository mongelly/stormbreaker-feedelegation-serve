import { TxBaseInfo } from "./txBaseInfo.entity";
import { Entity, Column,Index, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";

@Entity("tx_delegation_clauses_index")
@Index("to_clauseindex",["toaddress","clause_index"],{unique:false})
export class TxClauseBaseInfo{

    @PrimaryColumn({name:"id"})
    public id!:string;

    @Column({name:"clause_index"})
    public clause_index!:number;

    @Column({name:"toaddress",length:42})
    @Index()
    public toaddress!:string;

    @Column({name:"amount"})
    public amount!:string;

    @Column({name:"data",type:"text"})
    public data!:string;

    @ManyToOne(() => TxBaseInfo,base => base.clauses)
    @JoinColumn({name:"txid"})
    public txInfo!:TxBaseInfo
}