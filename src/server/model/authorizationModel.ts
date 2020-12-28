import { ActionData, ActionResult } from "../../utils/components/actionResult";
import { DateEx } from "../../utils/extensions/dateEx";
import { AuthorizationInfo } from "./entities/auth.entity";
import {v4 as uuid} from 'uuid';
import { getConnection } from "typeorm";

export default class AuthorizationModel{

    constructor(env:any){
        this.env = env;
    }

    public async registered():Promise<ActionData<{authorization:AuthorizationInfo}>>{
        let result = new ActionData<{authorization:AuthorizationInfo}>();

        let info = new AuthorizationInfo();
        info.appid = uuid();
        info.createts = DateEx.getTimeStamp();
        info.valid = true;

        try {
            let connection = getConnection();
            await connection
            .createQueryBuilder()
            .insert()
            .into(AuthorizationInfo)
            .values(info)
            .execute();
            result.data = {authorization:info}
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`registered faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }
        return result;
    }

    public async getAuthorizationInfo(appid:string):Promise<ActionData<{authorization:AuthorizationInfo}>>{
        let result = new ActionData<{authorization:AuthorizationInfo}>();

        try {
            let connection = getConnection();
            let info = await connection
            .getRepository(AuthorizationInfo)
            .createQueryBuilder()
            .where("appid = :appid",{appid:appid})
            .andWhere("valid =:valid",{valid:true})
            .getOne();

            if(info != undefined){
                result.data = {authorization:info};
            }
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`getAuthorizationInfo faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    public async removeAuthorizationInfo(appid:string):Promise<ActionResult>{
        let result = new ActionResult();

        try {
            let connection = getConnection();
            await connection
            .createQueryBuilder()
            .update(AuthorizationInfo)
            .set({valid:false})
            .where("appid = :appid",{appid:appid})
            .execute();
            result.succeed = true;
        } catch (error) {
            result.error = new Error(`removeAuthorizationInfo faild: ${JSON.stringify(error)}`);
            result.succeed = false;
        }

        return result;
    }

    private env:any;
}