import Axios from "axios";
import { ActionData } from '../components/actionResult';

export class HttpClientHelper{

    public timeout:number = 40000;

    public async request(url:string,method:RequestMethod,urlParames:any|undefined,
        headers:any|undefined,body:any|undefined):Promise<ActionData<{body:any|undefined,headers:Map<string,any>}>>{
            let result = new ActionData<{body:any|undefined,headers:any}>();
            try {
                let response = await Axios({url:url,method:method,responseType:"json",timeout:this.timeout,headers:headers,params:urlParames,data:body});
                result.data = {
                    body:response.data,
                    headers:response.headers
                }
                result.succeed = true;
            } catch (error) {
                if(error.isAxiosError){
                    result.succeed = false;
                    result.code = String(error.response.status || "")
                    result.message = String(error.response.data || "");
                    result.error = error;
                } else {
                    result.succeed = false;
                    result.code = "500";
                    result.error = error;
                }
            }

            return result;
        }
}

export type RequestMethod = | 'get' | 'GET'
| 'delete' | 'DELETE'
| 'head' | 'HEAD'
| 'options' | 'OPTIONS'
| 'post' | 'POST'
| 'put' | 'PUT'
| 'patch' | 'PATCH'
| 'purge' | 'PURGE'
| 'link' | 'LINK'
| 'unlink' | 'UNLINK'