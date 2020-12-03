import Router from 'koa-router'
import FeeDelegationRouter from './controllers/feedelegation/router';

export default class RootRouter extends Router{
    constructor(env:any){
        super();
        new FeeDelegationRouter(env);

        for(const router of env.routerArray){
            if(router.addRootRouter){
                this.use("",router.routes()).use(router.allowedMethods());
            }
        }
    }
}