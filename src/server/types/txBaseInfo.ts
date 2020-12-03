import { BigNumberEx } from "../../framework/helper/bigNumberEx";

export class TxBaseInfo{
    public txid:string = "";
    public origin:string = "";
    public delegator:string = "";
    public gas:BigNumberEx = BigNumberEx.ZERO;
    public signTs:number = 0;
    public clauses:Array<TxClauseBaseInfo> = new Array();
}

export class TxClauseBaseInfo{
    public clauseIndex:number = 0;
    public toaddress:string = "";
    public amount:BigNumberEx = BigNumberEx.ZERO;
    public data:string = "";
}