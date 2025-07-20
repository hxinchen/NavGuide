import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const res = await prisma.tool.findMany();
console.log(res);







