const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(
);

async function main() {
  // 清空现有数据
  await prisma.tool.deleteMany();
  await prisma.category.deleteMany();

  // 创建分类
  const devTools = await prisma.category.create({
    data: {
      name: '开发工具',
      description: '提升开发效率的必备工具',
    },
  });

  // 创建工具
  await prisma.tool.create({
    data: {
      name: 'Visual Studio Code',
      description: '强大的代码编辑器，支持多种编程语言和丰富的插件生态系统，是现代开发者的首选工具。',
      icon: '/icons/vscode.png',
      url: 'https://code.visualstudio.com',
      tags: JSON.stringify(['编辑器', '免费', '跨平台']),
      popular: 95,
      categoryId: devTools.id,
    },
  });

  await prisma.tool.create({
    data: {
      name: 'WebStorm',
      description: '专业的 Web 开发 IDE，提供智能代码补全、调试和测试工具，适合大型项目开发。',
      icon: '/icons/webstorm.png',
      url: 'https://www.jetbrains.com/webstorm/',
      tags: JSON.stringify(['IDE', '付费', 'JavaScript']),
      popular: 85,
      categoryId: devTools.id,
    },
  });

  console.log('数据库种子数据创建成功');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });