import path from "path";
import ActiveSupportServices from "./activeSupportService";
import FeeDelegateionServer from "./feedelegationServer";
import Environment from "./environment";
import { initErrorMap } from "./initErrorMap";
import NetworkHelper from "../utils/helper/networkHelper";

process.setMaxListeners(50);

let configPath = path.join(__dirname, "../../config/config.json");
let config = require(configPath);

let globalEnvironment:any;
globalEnvironment = new Environment(config);

initErrorMap();

export let environment = globalEnvironment;

(new ActiveSupportServices()).activieSupportServices().then(action => {
    if(action.succeed){
        let port = environment.config.port;
        let app = new FeeDelegateionServer(environment);
        app.listen(port);
        console.info(`${config.serviceName} active successful`);
        console.info(`Server run at:\r\n - Local: http://localhost:${port} \r\n - Network: http://${NetworkHelper.geIPAddress()}:${port}`);
    } else {
        console.error("Support Active Faild: " + action.message);
        process.exit();
    }
}).catch(error => {
    console.error("Support Active Faild");
    process.exit();
});
