import path from "path";
import { createConnection } from "typeorm";
import { TxDelegatorHistoryModel, TxFilter } from "../server/model/txDelegationHistoryModel";
import assert from 'assert';

describe('TxDelegatorHistoryModel Test', () => {

    const dbConfig = {
        type:"sqlite",
        database:"/Users/moglu/Developer/dataCenter/sqlite/stormbreaker_feedelegation_serve.sqlite3",
        enableWAL:true
    }
    const entitiesDir = path.join(__dirname,"../server/*/entities/**.entity{.ts,.js}");
    const connectionOptions:any = dbConfig;
    connectionOptions.entities = [entitiesDir];

    const connection = undefined;
    before( async () => {
        const connection = await createConnection(connectionOptions);
    });

    it('select by txid', async () => {
        let model = new TxDelegatorHistoryModel({});
        let filter = new TxFilter();
        filter.origins = ["0x9925d8351790865ca0dd5f137346dd84e5784af7","0x7567d83b7b8d80addcb281a71d54fc7b3364ffed"];
        let execResult = await model.selectHistroyByFilter(filter);
        if(execResult.succeed){
            let data = execResult.data;
        } else {
            assert.fail("selectHistroyByFilter faild");
        }
    });

})