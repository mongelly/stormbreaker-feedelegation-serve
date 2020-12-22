import { ActionResultWithData } from "../framework/components/actionResult";

export interface iSignServe{
    sign(txRaw:string,origin:string,delegator:string):Promise<ActionResultWithData<{signature:Buffer}>>;
}