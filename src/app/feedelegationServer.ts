import Koa from 'koa';
import { URLCodeMiddleware } from '../framework/middleware/uricodeMiddleware';
import RootRouter from './rootRouter';
import bodyParser from "koa-bodyparser"

export default class FeeDelegateionServer extends Koa
{
    public constructor(env:any){
        super();
        let rootRouter = new RootRouter(env);
        this.use(URLCodeMiddleware.URLDecoder);
        this.use(bodyParser());
        this.use(env.logHelper.httpLogger);
        this.use(rootRouter.routes()).use(rootRouter.allowedMethods());
    }
}