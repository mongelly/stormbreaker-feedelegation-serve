import { Entity, Index, Column ,OneToMany, PrimaryColumn } from "typeorm";
import { TxClauseBaseInfo } from "./txClauseBaseInfo.entity";

@Entity("tx_delegation")
export class TxBaseInfo{

    @PrimaryColumn({name:"txid",length:66})
    public txid!:string;

    @Index()
    @Column({name:"origin",length:42})
    public origin!:string;

    @Index()
    @Column({name:"delegator",length:42})
    public delegator!:string;

    @Column({name:"gas"})
    public gas!:string;

    @Column({name:"signts"})
    public signts!:number;

    @OneToMany(type => TxClauseBaseInfo,clause => clause.txInfo,{cascade:true})
    public clauses!:TxClauseBaseInfo[]
}