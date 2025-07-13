import { Context } from 'koa';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default{
    //获取所有工具
    async getAllTools(ctx:Context){
        try{
            const tools=await prisma.tool.findMany({
                include:{ category:true}
            });
            ctx.body=tools;

        }catch(error){
            ctx.status=500;
            ctx.body={error:error instanceof Error? error.message : '获取工具失败'}
        }
    },
    async getToolById(ctx:Context){
        try{
            const id= parseInt(ctx.params.id)
            const tool=await prisma.tool.findUnique({
                where:{id},
                include:{category:true}
            })
            if(!tool){
                ctx.status=404;
                ctx.body={error:'工具不存在'}
                return;
            }
            ctx.body=tool;
        }catch(error){
            ctx.status=500;
            ctx.body={error:error instanceof Error? error.message : '查询工具失败'}
        }   
    }
}