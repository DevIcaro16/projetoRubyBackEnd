//Importação do PrismaClient -> Necessário para as Migrations
import { PrismaClient } from "@prisma/client";

//Instância:
const prismaClient = new PrismaClient();

//Exportação:
export default prismaClient;