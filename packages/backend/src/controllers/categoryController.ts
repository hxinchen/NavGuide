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
    },

    // 创建新分类
    async createCategory(ctx: Context) {
        try {
            const { name, description } = ctx.request.body as any;

            // 验证必填字段
            if (!name) {
                ctx.status = 400;
                ctx.body = { error: '请求无效: 缺少分类名称' };
                return;
            }

            const data: any = { name };

            // 处理可选字段
            if (description !== undefined) {
                data.description = description;
            }

            const category = await prisma.category.create({
                data,
                include: { tools: true }
            });

            ctx.status = 201;
            ctx.body = category;
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: error instanceof Error ? error.message : '创建分类失败' };
        }
    },

    // 更新分类
    async updateCategory(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            const { name, description } = ctx.request.body as any;

            if (isNaN(id)) {
                ctx.status = 400;
                ctx.body = { error: '无效的分类ID' };
                return;
            }

            const data: any = {};
            
            // 动态构建更新数据
            if (name !== undefined) data.name = name;
            if (description !== undefined) data.description = description;

            if (Object.keys(data).length === 0) {
                ctx.status = 400;
                ctx.body = { error: '未提供任何更新数据' };
                return;
            }

            const category = await prisma.category.update({
                where: { id },
                data,
                include: { tools: true }
            });

            ctx.body = category;
        } catch (error: any) {
            if (error.code === 'P2025') {
                ctx.status = 404;
                ctx.body = { error: '分类不存在' };
            } else {
                ctx.status = 500;
                ctx.body = { error: error instanceof Error ? error.message : '更新分类失败' };
            }
        }
    },

    // 删除分类
    async deleteCategory(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            
            if (isNaN(id)) {
                ctx.status = 400;
                ctx.body = { error: '无效的分类ID' };
                return;
            }

            await prisma.category.delete({
                where: { id }
            });
            
            ctx.status = 204; // No Content
        } catch (error: any) {
            if (error.code === 'P2025') {
                ctx.status = 404;
                ctx.body = { error: '分类不存在' };
            } else {
                ctx.status = 500;
                ctx.body = { error: error instanceof Error ? error.message : '删除分类失败' };
            }
        }
    }
}
