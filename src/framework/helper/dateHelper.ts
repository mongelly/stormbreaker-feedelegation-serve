export default class DateHelper{
    public static getTimeStamp(date:Date):number{
        return parseInt((date.getTime() / 1000).toString());
    }
}