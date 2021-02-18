import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("app_info")
export class AppInfo{

    @PrimaryColumn({name:"appid",length:50})
    public appid!:string;

    @Column({name:"createts"})
    public createts!:number;

    @Column({name:"valid"})
    public valid!:boolean;
}