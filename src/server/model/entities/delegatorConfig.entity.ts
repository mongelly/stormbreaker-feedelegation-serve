import { Entity, Index, Column, PrimaryColumn } from "typeorm";

@Entity("delegator_config")
export class DelegatorConfig{

    @PrimaryColumn({name:"appid",length:50})
    public appid!:string;

    @Column({name:"delegator",length:42})
    @Index()
    public delegator!:string;

}