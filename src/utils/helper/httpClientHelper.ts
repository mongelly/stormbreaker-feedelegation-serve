import httpRequest from 'request';
import { ActionData } from '../components/actionResult';

export class HttpClientHelper{

    public timeout:number = 40000;

    public async request(url:string,method:string,urlParames:Map<string,string>|undefined,
        headers:Map<string,any>|undefined,body:any|undefined):Promise<ActionData<{body:any|undefined,headers:Map<string,any>}>>{
            let eUrl = this.addParamesToURL(url,urlParames);
            let options:httpRequest.CoreOptions = {
                method:method,
                json:true,
                headers:headers,
                body:body,
                timeout:this.timeout
            };
            return new Promise((resolve:(result:ActionData<{body:any|undefined,headers:Map<string,any>}>)=>void)=>{
                httpRequest(eUrl,options,(error: any, response: httpRequest.RequestResponse) =>{
                    let httpResult = new ActionData<{body:any|undefined,headers:Map<string,any>}>();
                    if(error == undefined && response.statusCode != undefined &&response.statusCode < 300){
                        let responseJson = response.toJSON();
                        httpResult.data = {
                            body:responseJson.body,
                            headers:responseJson.headers as Map<string,any>
                        }
                        httpResult.succeed = true;
                    } else {
                        httpResult.succeed = false;
                        httpResult.code = String(response.statusCode);
                        httpResult.message = JSON.stringify(response.body);
                        httpResult.error = error;
                    }
                    resolve(httpResult);
                });
            });
    }

    private addParamesToURL(url:string,urlParames:Map<string,string>|undefined):string
    {
        let result = url;
        let paramesString = "";
        if(urlParames && urlParames.size>0){
            urlParames.forEach((value,key) => {
                paramesString += `&${key}=${value}`;
            });
        }
        if(paramesString.length>0){
            result = url.trim() + "?" + paramesString.substr(1);
        }

        return result;
    }
}