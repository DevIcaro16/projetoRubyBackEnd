"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarTokenService = void 0;
const dotenv_1 = require("dotenv"); // Para carregar variáveis de ambiente
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
(0, dotenv_1.config)(); // Inicializar variáveis de ambiente
class verificarTokenService {
    execute(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_1);
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
            }
            catch (error) {
                return false;
            }
        });
    }
}
exports.verificarTokenService = verificarTokenService;