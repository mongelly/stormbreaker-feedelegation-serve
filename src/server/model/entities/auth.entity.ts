import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("authorization_info")
export class AuthorizationInfo{

    @PrimaryColumn({name:"appid",length:50})
    public appid!:string;

    @Column({name:"createts"})
    public createts!:number;

    @Column({name:"valid"})
    public valid!:boolean;
}