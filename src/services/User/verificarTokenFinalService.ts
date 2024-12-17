import prismaClient from "../../prisma";
import nodemailer from "nodemailer"; // Para envio de emails
import { promises as fs } from "fs"; // Para manipulação de arquivos
import { config } from "dotenv"; // Para carregar variáveis de ambiente
import jwt from 'jsonwebtoken';

config(); // Inicializar variáveis de ambiente

class verificarTokenFinalService{
    async execute(token: string){
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_2);
            console.log(decoded);
            return {
                success: true,
                decoded: decoded
            };
        } catch (error) {
            return false;
        }
    }
}

export { verificarTokenFinalService };