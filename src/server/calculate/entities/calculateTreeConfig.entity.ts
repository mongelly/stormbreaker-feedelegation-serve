import { Entity, PrimaryColumn, Column } from "typeorm";
import { TreeConfig } from "../../../utils/calculateEngine/src/calculateEngine/treeConfig";
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

    @Column({name:"config",type: 'text',transformer:simpleJSON<TreeConfig>("calculate_tree_config.config")})
    public config!:TreeConfig
}