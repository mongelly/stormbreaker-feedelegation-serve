import { ActionResult } from "./actionResult";

export default interface IActiveSupportServices
{
    activieSupportServices(env:any):Promise<ActionResult>;
}