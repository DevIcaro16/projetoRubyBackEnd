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
exports.ConfirmarPlanoService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const nodemailer_1 = __importDefault(require("nodemailer")); // Para envio de emails
const dotenv_1 = require("dotenv"); // Para carregar variáveis de ambiente
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mercadoPagoConfig_1 = require("../../mercadoPagoConfig");
const axios_1 = __importDefault(require("axios"));
(0, dotenv_1.config)(); // Inicializar variáveis de ambiente
class ConfirmarPlanoService {
    generateToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return jsonwebtoken_1.default.sign(data, process.env.JWT_SECRET_2, { expiresIn: "12h" });
        });
    }
    gerarPix(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const idempotencyKey = `${Date.now()}-${Math.random()}`;
            try {
                const response = yield axios_1.default.post("https://api.mercadopago.com/v1/payments", paymentData, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Idempotency-Key": idempotencyKey,
                        Authorization: `Bearer ${mercadoPagoConfig_1.mercadoPagoConfig.accessToken}`,
                    },
                });
                return response.data; // Retorna os dados do PIX
            }
            catch (error) {
                console.error("Erro ao gerar PIX:", error);
                throw new Error("Falha ao processar o pagamento com Mercado Pago.");
            }
        });
    }
    verificarPlanoExistente(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(JSON.stringify(userData));
            const verificarPlanoExistente = yield prisma_1.default.pagamento.findFirst({
                where: {
                    cgc: userData['CGC'],
                    pag: userData['VAL'],
                    mat: userData['MAT'],
                    ini: userData['INI'],
                    fim: userData['FIM'],
                }
            });
            if (verificarPlanoExistente) {
                console.log("Verifcar Plano Existente!" + JSON.stringify(verificarPlanoExistente));
                return false;
            }
            else {
                return true;
            }
        });
    }
    enviarEmails(email, userData, pixData) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = nodemailer_1.default.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });
            const emailsEnviados = [];
            const intervaloEnteEmails = 5;
            const momentoAtual = Date.now();
            const tempoLimite = intervaloEnteEmails * 60 * 1000;
            for (let i = emailsEnviados.length - 1; i >= 0; i--) {
                if (momentoAtual - emailsEnviados[i].timestamp > tempoLimite) {
                    emailsEnviados.splice(i, 1);
                }
            }
            const emailExistente = emailsEnviados.some((item) => item.email === email);
            if (emailExistente) {
                throw new Error("Email já enviado! Aguarde um tempo de 5 minutos antes de reenviar.");
            }
            // Gerar token com informações do usuário
            const token = yield this.generateToken(userData);
            // Conteúdo do e-mail para o cliente
            const textEmailCli = `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333; padding: 30px 20px;">
  <div style="max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <!-- Cabeçalho com logo -->
    <header style="background-color: #fff; padding: 20px; text-align: center;">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvV804ZTmDRXUG4cxSodfy6fGW5Jin9hb9ZA&s" alt="Logo" style="max-width: 100%; height: auto;">
    </header>
    
    <!-- Conteúdo Principal -->
    <main style="padding: 30px 20px; text-align: center;">
      <h1 style="color: #007bff; text-align: center; font-size: 24px; margin-bottom: 20px;">Pagamento do Plano RUBY</h1>
      <p style="font-size: 16px; color: #666; margin-left: 5px ;margin-bottom: 30px; padding-left: 20px;">
        Realize o pagamento via PIX e nos envie o comprovante para garantir sua licença. Abaixo estão os detalhes para efetuar o pagamento.
      </p>

      <!-- Detalhes do Pagamento -->
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #ddd;">
        <p style="font-size: 16px; color: #333; padding-left: 20px;">
          <b style="font-size: 18px; font-weight: bold;">CHAVE PIX:<br/></b>
             <span style="color: #333; font-weight: bold; background-color: #e1f5fe; padding: 5px; border-radius: 4px; font-size: 16px;">
               ${pixData.point_of_interaction.transaction_data.qr_code}
            </span>
        </p>
        <p style="font-size: 16px; color: #333; padding-left: 20px;">
          <b style="font-size: 18px; color: #007bff;">VALOR:</b> <span style="font-size: 20px; font-weight: bold; color: #e91e63;">R$ ${pixData.transaction_amount.toFixed(2)}</span>
        </p>
      </div>

      <!-- Link para pagamento -->
      <p style="font-size: 16px; color: #666; margin-bottom: 30px; padding-left: 20px;">
        Caso prefira, você pode utilizar este <a href="${pixData.point_of_interaction.transaction_data.ticket_url}" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;">link para pagamento</a>.
      </p>

      <!-- Mensagem adicional -->
      <p style="font-size: 16px; color: #333; margin-bottom: 30px; padding-left: 20px;">
        Após o pagamento, iremos processar seu pedido e enviar um e-mail confirmando sua licença. 😁
        <br><br>
        Caso tenha qualquer dúvida ou precise de suporte, entre em contato conosco:
        <br>
        <strong>Telefone:</strong> (85) 99607-1621
        <br>
        <strong>E-mail:</strong> micromoneyprogramacao@gmail.com
      </p>

      <!-- Aviso -->
      <p style="font-size: 14px; color: #999; padding-left: 20px;">
        Se você não solicitou esta ação, ignore este e-mail.
      </p>
    </main>
    
    <!-- Rodapé -->
    <footer style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      © 2024 Micro&Money - Softwares Inteligentes. Todos os direitos reservados.
    </footer>
  </div>
</div>
`;
            // Conteúdo do e-mail para administradores
            const textEmailAdmin = `
<div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; text-align: center;">
  <div style="max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <header style="background-color: #FFF; padding: 20px;">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvV804ZTmDRXUG4cxSodfy6fGW5Jin9hb9ZA&s" alt="Logo" style="max-width: 100%; height: auto;">
    </header>
    <main style="padding: 20px;">
      <h1 style="color: #333;">Novo Cliente Adicionado!</h1>
      <p style="font-size: 16px; color: #666;">
        Um novo cliente se cadastrou e escolheu o plano RUBY.
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        <strong>Informações do cliente:</strong>
      </p>
      <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-size: 14px; color: #000; text-align: left;">
${JSON.stringify(userData, null, 2)}
      </pre>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        <strong>Token com os dados do cliente:</strong>
      </p>
      <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-size: 14px; color: #000; text-align: left;">
${token}
      </pre>
      <p style="margin-top: 20px; font-size: 14px; color: #999;">
        Favor verificar os dados no sistema para confirmar o cadastro.
      </p>
    </main>
    <footer style="background-color: #f1f1f1; padding: 10px; font-size: 12px; color: #666;">
      © 2024 Micro&Money - Softwares Inteligentes. Todos os direitos reservados.
    </footer>
  </div>
</div>
`;
            // Configurações do e-mail para o cliente
            const mailOptionsCli = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Confirmando Pagamento do seu RUBY",
                html: textEmailCli,
            };
            // Configurações do e-mail para administradores
            const mailOptionsAdmin = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: "Novo Cliente para o RUBY!",
                html: textEmailAdmin,
            };
            const envioCli = yield transporter.sendMail(mailOptionsCli);
            const envioAdmin = yield transporter.sendMail(mailOptionsAdmin);
            if (envioCli && envioAdmin) {
                return token;
            }
            else {
                console.log("error");
                return false;
            }
        });
    }
}
exports.ConfirmarPlanoService = ConfirmarPlanoService;
