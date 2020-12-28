export module DateEx{
    export function getTimeStamp(date?:Date):number{
        const _data = date || new Date();
        return parseInt((_data.getTime() / 1000).toString());
    }
}