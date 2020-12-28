import { ActionData } from "../utils/components/actionResult";

export interface iSignServe{
    sign(txRaw:string,origin:string,delegator:string):Promise<ActionData<{signature:Buffer}>>;
}