import { Entity, PrimaryColumn, Column, Index, OneToOne } from "typeorm";
import { ICalculateTreeConfig } from "../../../utils/calculateEngine/calculateTreeConfig";
import { simpleJSON } from "../../../utils/extensions/transformers";

@Entity("calculate_tree_config")
export class CalculateTreeConfigEntity{

    @PrimaryColumn({name:"appid",length:50})
    public appid!:string

    @Column({name:"configid",length:50})
    public configid!:string;

    @Column({name:"createts"})
    public createts!:number;

    @Column({name:"updatets"})
    public updatets!:number;

    @Column({name:"valid"})
    public valid!:boolean;

    @Column({name:"config",type: 'text',transformer:simpleJSON<ICalculateTreeConfig>("calculate_tree_config.config")})
    public config!:ICalculateTreeConfig
}