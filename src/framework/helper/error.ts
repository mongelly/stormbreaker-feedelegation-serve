import IError from "../components/iError";

export default class FrameworkErrorDefine {
    public static INTERNALSERVERERROR:IError = {code:500,message:"",datails:undefined};
    public static BADREQUEST:IError = {code:1000,message:"",datails:undefined};
}