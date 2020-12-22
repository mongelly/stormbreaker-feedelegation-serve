import Koa from 'koa';
import { URLCodeMiddleware } from '../framework/middleware/uricodeMiddleware';
import RootRouter from './rootRouter';
import bodyParser from "koa-bodyparser"
import cors = require('koa2-cors');

export default class FeeDelegateionServer extends Koa
{
    public constructor(env:any){
        super();
        let rootRouter = new RootRouter(env);
        this.use(cors({
            origin(ctx: Koa.Context) {
                return '*';
            },
            exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
            maxAge: 5,
            credentials: true,
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
        }));
        this.use(URLCodeMiddleware.URLDecoder);
        this.use(bodyParser());
        this.use(env.logHelper.httpLogger);
        this.use(rootRouter.routes()).use(rootRouter.allowedMethods());
        
    }
}