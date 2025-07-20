import { Context } from 'koa';
import { PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export default {
    //获取所有分类
    async getAllCategory(ctx:Context){
        try{
            const categories=await prisma.category.findMany({
                include:{tools:true}
            })
            ctx.body=categories;
        }catch(error){
            ctx.status=500;
            ctx.body={error:error instanceof Error ? error.message : '未知错误'}
        }
    },
    async getCategoryByid(ctx:Context){
        const id =parseInt(ctx.params.id);
        if(isNaN(id)){
            ctx.status=400;
            ctx.body={error:'无效的分类ID'};
            return;
        }
        try{
            const category = await prisma.category.findUnique({
                where:{id},
                include:{tools:true}
            });
            
            if(!category){
                ctx.status=404;
                ctx.body={error:'分类不存在'};
                return;
            }
            ctx.body=category;
            
        }catch(error){
            ctx.status=500;
            ctx.body={error:error instanceof Error? error.message:'查询失败'}
        }
    }
}