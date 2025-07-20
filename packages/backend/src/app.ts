import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Router from 'koa-router'; // 1. 额外导入 Router

//导入路由
import categoryRoutes from './routes/categoryRoutes';
import toolRoutes from './routes/toolRoutes';

//创建实例
const app = new Koa();
const apiRouter = new Router(); // 2. 创建一个主路由实例

//中间件
app.use(cors());
app.use(bodyParser());

//基础路由 (可选，可以保留)
app.use(async (ctx,next)=>{
    if(ctx.path==='/'){
        ctx.body={message:'DevKit API 服务运行中'};
    }else{
        await next();
    }
})

// 3. 将所有子路由合并到主路由中
apiRouter.use(categoryRoutes.routes(), categoryRoutes.allowedMethods());
apiRouter.use(toolRoutes.routes(), toolRoutes.allowedMethods());


// 4. 只将这个合并后的主路由注册到应用中
app.use(apiRouter.routes()).use(apiRouter.allowedMethods());

export default app;