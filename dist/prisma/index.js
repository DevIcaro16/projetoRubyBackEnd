"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Importação do PrismaClient -> Necessário para as Migrations
const client_1 = require("@prisma/client");
//Instância:
const prismaClient = new client_1.PrismaClient();
//Exportação:
exports.default = prismaClient;
