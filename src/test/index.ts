import { createConnection } from "typeorm";
import CalculateConfigModel from "../server/calculate/calculateConfigModel";
import { CalculateInstanceConfigEntity } from "../server/calculate/entities/calculateInstanceConfig.entity";
import { CalculateTreeConfigEntity } from "../server/calculate/entities/calculateTreeConfig.entity";
import { ICalculateInstanceConfig } from "../utils/calculateEngine/calculateInstanceConfig";

const dbConfig:any = {
    type:"mysql",
    host:"localhost",
    port:3306,
    username:"vechain",
    password:"vechain",
    database:"stormbreaker_feedelegation_serve_orm"
}

async function main() {
    const connection = await createConnection({
        type: dbConfig.type,
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        entities:[CalculateTreeConfigEntity,CalculateInstanceConfigEntity],
        logging:true
    });

    if(connection.isConnected){
        await connection.synchronize();
    }

    let model = new CalculateConfigModel({});

    let appid = "c164997a-e4e9-4b06-8242-c4389328704e"
    let config:ICalculateInstanceConfig = {"configs": [{"config": {"callLimit": 5, "timeInterval": 86400}, "instanceid": "3535822f-acf5-4ecb-b1a3-c71dae62b472"}, {"config": {"smartcontract_whitelist": [{"address": "0x2042AFd23011b454e4F1C94Cf350AA9E09d0ddb4", "functionHashs": ["0x4e71d92d"]}]}, "instanceid": "4de3bf24-27d0-48e2-a7e6-410305e0334c"}], "instanceid": "2c114ecf-e51d-428c-b137-e67a41d6bad5"}


    let dbResult = await model.saveCalculateInstanceConfig(appid,config);
    console.log(dbResult);

    // let result = await model.getCalculateTreeConfig(appid);
    // console.log(result);
}

main();

