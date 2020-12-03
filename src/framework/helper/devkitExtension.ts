import * as Devkit from 'thor-devkit'
import { Transaction } from 'thor-devkit'
import { blake2b256 } from 'thor-devkit/dist/cry/blake2b';

export default class DevkitExtension{
    public static calculateIDWithUnsigned(txBody:Devkit.Transaction.Body,origin:string):string{
        let tx = new Transaction(txBody);
        return "0x" + blake2b256(Buffer.concat([tx.signingHash(),Buffer.from(origin)])).toString('hex');
    }

    public static decodeTransaction(raw:string):Devkit.Transaction{
        let transaction;

        if(raw.substr(0,2).toLocaleLowerCase() == "0x"){
            raw = raw.substr(2).toLocaleLowerCase();
        }
        try {
            transaction = Devkit.Transaction.decode(Buffer.from(raw,"hex"));
        } catch (error) {
            try {
                transaction = Devkit.Transaction.decode(Buffer.from(raw,"hex"),true);
            } catch (error) {
                throw error;
            }
        }

        return transaction;
    }
}