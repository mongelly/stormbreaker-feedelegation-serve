import { Entity, PrimaryColumn, Column, } from "typeorm";
import { ICalculateInstanceConfig } from "../../../utils/calculateEngine/calculateInstanceConfig";
import { simpleJSON } from "../../../utils/extensions/transformers";

@Entity("calculate_instance_config")
export class CalculateInstanceConfigEntity{

    @PrimaryColumn({name:"appid",length:50})
    public appid!:string

    @Column({name:"instanceid",length:50})
    public instanceid!:string;

    @Column({name:"createts"})
    public createts!:number;

    @Column({name:"updatets"})
    public updatets!:number;

    @Column({name:"valid"})
    public valid!:boolean;

    @Column({name:"config",type: 'text',transformer:simpleJSON<ICalculateInstanceConfig>("calculate_instance_config.config")})
    public config!:ICalculateInstanceConfig
}