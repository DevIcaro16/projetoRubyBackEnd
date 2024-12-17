import prismaClient from "../../prisma";
import nodemailer from "nodemailer"; // Para envio de emails
import { promises as fs } from "fs"; // Para manipulação de arquivos
import { config } from "dotenv"; // Para carregar variáveis de ambiente
import jwt from 'jsonwebtoken';

config(); // Inicializar variáveis de ambiente

class verificarTokenService{
    async execute(token: string){
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_1);
            console.log(decoded);

            // const verificarPlanoExistente = await prismaClient.pagamento.findFirst({
            //     where:{
            //         cgc: decoded['CGC'],
            //         pag: decoded['PAG'],
            //         ini: decoded['ini'],
            //         fim: decoded['fim']
            //     }

            // });

            // if(verificarPlanoExistente){
            //     return {
            //         success: false,
            //         message: "Plano Já Registrado!"
            //     };
            // }else{
            //     return {
            //         success: true,
            //         decoded: decoded
            //     };
            // }

            return {
                        success: true,
                        decoded: decoded
                    };
            
        } catch (error) {
            return false;
        }
    }
}

export { verificarTokenService };