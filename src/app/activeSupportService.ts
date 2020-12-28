import { environment } from ".";
import { ActionResult } from "../utils/components/actionResult";
import IActiveSupportServices from "../utils/components/iActiveSupportService";
import { createConnection } from "typeorm";
import path from "path";

export default class ActiveSupportServices implements IActiveSupportServices{
    public async activieSupportServices():Promise<ActionResult> {
        let result = new ActionResult();
        try {
            const dbConfig = environment.config.dbConfig;
            const entitiesDir = path.join(__dirname,"../server/*/entities/**.entity{.ts,.js}");
            const connectionOptions:any = dbConfig;
            connectionOptions.entities = [entitiesDir];
            const connection = await createConnection(connectionOptions);
            if(connection.isConnected){
                await connection.synchronize();
                result.succeed = true;
            } else {
                let errorMsg = `DataBase [db:${JSON.stringify(environment.config.dbConfig)}] initialize faild`;
                console.error(errorMsg)
                result.error = errorMsg;
                result.succeed = false;
                return result;
            }
        } catch (error) {
            let errorMsg = `DataBase [db:${JSON.stringify(environment.config.dbConfig)}] initialize faild`;
            console.error(errorMsg)
            result.error = errorMsg;
            result.succeed = false;
            return result;
        }
        return result;
    }
}