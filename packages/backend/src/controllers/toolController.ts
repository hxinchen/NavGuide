import { Context } from 'koa';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default {
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

    //根据ID获取工具
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
    },

    // 创建新工具
    async createTool(ctx: Context) {
        try {
            const { name, url, categoryId, description, tags } = ctx.request.body as any;

            // 验证必填字段
            if (!name || !url || typeof categoryId !== 'number') {
                ctx.status = 400;
                ctx.body = { error: '请求无效: 缺少 name, url, 或 categoryId' };
                return;
            }

            const data: any = { name, url, categoryId };

            // 处理可选字段
            if (description !== undefined) {
                data.description = description;
            }
            if (tags !== undefined) {
                data.tags = JSON.stringify(tags);
            }

            const tool = await prisma.tool.create({
                data,
                include: { category: true } // 返回结果中包含分类信息
            });

            ctx.status = 201;
            ctx.body = tool;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                ctx.status = 400;
                ctx.body = { error: '创建失败：指定的分类不存在' };
            } else {
                ctx.status = 500;
                ctx.body = { error: error instanceof Error ? error.message : '创建工具失败' };
            }
        }
    },
    
    // 更新工具
    async updateTool(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            const { name, description, url, categoryId, tags } = ctx.request.body as any;

            const data: any = {};
            
            // 动态构建更新数据，只有提供的字段才会被更新
            if (name !== undefined) data.name = name;
            if (description !== undefined) data.description = description;
            if (url !== undefined) data.url = url;
            if (categoryId !== undefined) data.categoryId = categoryId;
            if (tags !== undefined) data.tags = JSON.stringify(tags);

            if (Object.keys(data).length === 0) {
                ctx.status = 400;
                ctx.body = { error: '未提供任何更新数据' };
                return;
            }

            const tool = await prisma.tool.update({
                where: { id },
                data,
                include: { category: true }
            });

            ctx.body = tool;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    ctx.status = 404;
                    ctx.body = { error: '工具不存在' };
                } else if (error.code === 'P2003') {
                    ctx.status = 400;
                    ctx.body = { error: '更新失败：指定的分类不存在' };
                } else {
                    ctx.status = 500;
                    ctx.body = { error: '更新工具失败' };
                }
            } else {
                ctx.status = 500;
                ctx.body = { error: error instanceof Error ? error.message : '更新工具失败' };
            }
        }
    },

    // 删除工具
    async deleteTool(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            await prisma.tool.delete({
                where: { id }
            });
            ctx.status = 204; // No Content
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                ctx.status = 404;
                ctx.body = { error: '工具不存在' };
            } else {
                ctx.status = 500;
                ctx.body = { error: error instanceof Error ? error.message : '删除工具失败' };
            }
        }
    }
}