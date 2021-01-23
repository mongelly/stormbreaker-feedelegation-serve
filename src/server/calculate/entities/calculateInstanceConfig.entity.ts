import { Entity, PrimaryColumn, Column, } from "typeorm";
import { InstanceConfig } from "../../../utils/calculateEngine/src/calculateEngine/instanceConfig";
import { simpleJSON } from "../../../utils/extensions/transformers";

@Entity("calculate_instance_config")
export class CalculateInstanceConfigEntity{

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

    @Column({name:"config",type: 'text',transformer:simpleJSON<InstanceConfig>("calculate_instance_config.config")})
    public config!:InstanceConfig
}