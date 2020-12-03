import path from "path";
import ActiveSupportServices from "./activeSupportService";
import FeeDelegateionServer from "./feedelegationServer";
import { GlobalEnvironment } from "./globalEnvironment";

process.setMaxListeners(50);

let configPath = path.join(__dirname, "../../config/config.json");
let config = require(configPath);

let globalEnvironment:any;
globalEnvironment = new GlobalEnvironment(config);

export let environment = globalEnvironment;
export let logHelper = (environment as GlobalEnvironment).logHelper;

(new ActiveSupportServices()).activieSupportServices().then(action => {
    if(action.Result){
        let port = environment.config.port;
        let app = new FeeDelegateionServer(environment);
        app.listen(port);
        logHelper.info("VeChain TokenSwap Server Active Successful Port:"+port);
    } else {
        logHelper.error("Support Active Faild: " + action.Message);
        process.exit();
    }
}).catch(error => {
    logHelper.error("Support Active Faild");
    process.exit();
});
