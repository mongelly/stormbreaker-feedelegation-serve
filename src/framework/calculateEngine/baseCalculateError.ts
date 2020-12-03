export class BaseCalculateError{
    public static SUBNODESINVALID = new Error("sub nodes invalid");

    public static CALCULATEERROR(err:any){
        return new Error("calculate error : " + JSON.stringify(err));
    }
    public static CREATEERROR(err:any){
        return new Error("crate error : " + JSON.stringify(err));
    }
}