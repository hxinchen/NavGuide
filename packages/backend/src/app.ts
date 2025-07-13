import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';

//导入路由
import categoryRoutes from './routes/categoryRoutes';
import toolRoutes from './routes/toolRoutes';

//创建实例
const app = new Koa();

//中间件
app.use(cors());
app.use(bodyParser());

//基础路由
app.use(async (ctx,next)=>{
    if(ctx.path==='/'){
        ctx.body={message:'DevKit API 服务运行中'};
    }else{
        await next();
    }
})

// 注册路由
app.use(categoryRoutes.routes());
app.use(categoryRoutes.allowedMethods());
app.use(toolRoutes.routes());
app.use(toolRoutes.allowedMethods());

export default app; 