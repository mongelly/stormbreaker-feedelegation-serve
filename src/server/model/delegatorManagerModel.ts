import { ActionData } from "../../utils/components/actionResult";
import { getConnection, getManager } from "typeorm";
import { DelegatorConfig } from "./entities/delegatorConfig.entity";

export default class DelegatorManagerModel{
    constructor(env:any){
        this.env = env;
    }

    public async getDelegator(appid:string):Promise<ActionData<{delegator:string}>>{
        let result = new ActionData<{delegator:string}>();

        try {
            let connection = getConnection();
            let data = await connection
            .getRepository(DelegatorConfig)
            .createQueryBuilder()
            .where("appid = :appid",{appid:appid})
            .getOne();

            if(data != undefined){
                result.data = { delegator: data.delegator};
            }
        } catch (error) {
            result.error = new Error(`getDelegator faild: ${JSON.stringify(error)}`);
        }

        return result;
    }

    private env:any;
}