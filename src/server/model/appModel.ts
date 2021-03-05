import { ActionData, ActionResult } from "../../utils/components/actionResult";
import { DateEx } from "../../utils/extensions/dateEx";
import { AppInfo } from "./entities/app.entity";
import {v4 as uuid} from 'uuid';
import { getConnection, getManager, getRepository } from "typeorm";

export default class AppModel{

    constructor(env:any){
        this.env = env;
    }

    public async registerNewApp():Promise<ActionData<{app:AppInfo}>>{
        let result = new ActionData<{app:AppInfo}>();

        let info = new AppInfo();
        info.appid = uuid();
        info.createts = DateEx.getTimeStamp();
        info.valid = true;

        try {
            await getManager()
            .save(info);
            result.data = {app:info};
        } catch (error) {
            result.error = new Error(`registerNewApp faild: ${JSON.stringify(error)}`);
        }
        return result;
    }

    public async getAppInfo(appid:string):Promise<ActionData<{app:AppInfo}>>{
        let result = new ActionData<{app:AppInfo}>();

        try {
            const appInfo = await getRepository(AppInfo).findOne({where:{appid:appid,valid:true}});
            if(appInfo != undefined){
                result.data = {app:appInfo};
            }
        } catch (error) {
            result.error = new Error(`getAppInfo faild: ${JSON.stringify(error)}`);
        }

        return result;
    }

    public async removeAppInfo(appid:string):Promise<ActionResult>{
        let result = new ActionResult();

        try {
            let connection = getConnection();
            await connection
            .createQueryBuilder()
            .update(AppInfo)
            .set({valid:false})
            .where("appid = :appid",{appid:appid})
            .execute();
        } catch (error) {
            result.error = new Error(`removeAppInfo faild: ${JSON.stringify(error)}`);
        }

        return result;
    }

    private env:any;
}