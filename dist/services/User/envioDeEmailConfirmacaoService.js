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
exports.EnvioDeEmailConfirmacaoService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = require("dotenv");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
(0, dotenv_1.config)();
class EnvioDeEmailConfirmacaoService {
    constructor() {
        // Armazena os e-mails enviados em uma variável global
        this.emailsEnviados = [];
    }
    // Função para extrair os dados das tags
    extractTags(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const extractedData = {};
            const tags = [
                "EMP",
                "CGC",
                "DES",
                "PRP",
                "EDR",
                "BAI",
                "CID",
                "TEL",
                "LOG",
                "PWD",
                "IDY",
                "CTR",
                "INI",
                "FIM",
                "MAT",
                "EMI",
                "VER",
                "ENV"
            ];
            tags.forEach((tag) => {
                const startTag = `<${tag}>`;
                const endTag = `</${tag}>`;
                const startIndex = content.indexOf(startTag);
                const endIndex = content.indexOf(endTag);
                if (startIndex !== -1 && endIndex !== -1) {
                    const value = content.substring(startIndex + startTag.length, endIndex);
                    extractedData[tag] = value.trim();
                }
            });
            return extractedData;
        });
    }
    generateToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return jsonwebtoken_1.default.sign(data, process.env.JWT_SECRET_1, { expiresIn: "1h" });
        });
    }
    checkCnpj(proprietario, cnpj, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formattedCnpj = cnpj.replace(/\D/g, "");
                const url = `https://www.receitaws.com.br/v1/cnpj/${formattedCnpj}`;
                const response = yield axios_1.default.get(url);
                const { nome, status } = response.data;
                if (status === "OK" && nome) {
                    console.log(nome);
                    return nome;
                }
                else {
                    yield this.enviarEmail(email, proprietario, "Ooops! Não Conseguimos Validar Seu CNPJ.", "Volte ao seu RUBY e tente novamente", this.getCnpjInvalidEmailTemplate());
                    throw new Error("CNPJ inválido ou não encontrado.");
                }
            }
            catch (error) {
                console.error("Erro ao validar o CNPJ:", error.message);
                throw new Error("Erro ao validar o CNPJ.");
            }
        });
    }
    checkCliente(CGC) {
        return __awaiter(this, void 0, void 0, function* () {
            let cliente = yield prisma_1.default.cliente.findFirst({
                where: {
                    cgc: CGC
                }
            });
            if (!cliente) {
                return "1";
            }
            else {
                return "2";
            }
        });
    }
    enviarEmail(email_1, propietario_1, empresa_1) {
        return __awaiter(this, arguments, void 0, function* (email, propietario, empresa, token = "", emailTemplate, tipoRotaEnvio) {
            const transporter = nodemailer_1.default.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });
            const intervaloEntreEmails = 5 * 60 * 1000; // 5 minutos em milissegundos
            const momentoAtual = Date.now();
            // Adicione logs para cada passo
            console.log("Emails Enviados Antes da Limpeza:", this.emailsEnviados);
            this.emailsEnviados = this.emailsEnviados.filter((item) => momentoAtual - item.timestamp <= intervaloEntreEmails);
            console.log("Emails Enviados Após a Limpeza:", this.emailsEnviados);
            const emailJaEnviado = this.emailsEnviados.some((item) => item.email === email && momentoAtual - item.timestamp <= intervaloEntreEmails);
            console.log("Email Já Enviado?", emailJaEnviado);
            console.log("Momento Atual:", momentoAtual);
            console.log("Intervalo Entre Emails (ms):", intervaloEntreEmails);
            // Log no push do e-mail
            if (!emailJaEnviado) {
                console.log("Adicionando novo e-mail à lista:", { email, timestamp: momentoAtual });
                this.emailsEnviados.push({ email, timestamp: momentoAtual });
            }
            let subjectText = "";
            let emailContent = "";
            if (emailJaEnviado) {
                // Se já enviado, usar o template de aviso
                subjectText = `Olá, ${propietario}!`;
                emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <header style="background-color: #FFF; padding: 20px;">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvV804ZTmDRXUG4cxSodfy6fGW5Jin9hb9ZA&s" alt="Logo" style="max-width: 100%; height: auto;">
          </header>
          <main style="padding: 20px;">
            <h1 style="color: #007bff;">${propietario}, <br> Já lhe enviamos um e-mail!</h1>
            <p style="font-size: 16px; color: #666; font-weight: bold;">
              Em nosso sistema já consta o envio de e-mail para sua empresa ${empresa}. Caso não tenha recebido, aguarde alguns minutos e tente novamente.
            </p>
            <p style="margin-top: 20px; font-size: 14px; color: #999;">
              Se você não solicitou esta ação, ignore este e-mail.
            </p>
          </main>
          <footer style="background-color: #f1f1f1; padding: 10px; font-size: 12px; color: #666;">
            © 2024 RUBY - MICROFOLHA. Todos os direitos reservados.
          </footer>
        </div>
      </div>`;
            }
            else {
                // Se não enviado, preparar o envio normal
                subjectText = `Olá, ${propietario}! Confirme o seu Plano RUBY`;
                emailContent =
                    emailTemplate ||
                        this.getDefaultEmailTemplate(propietario, empresa, token, tipoRotaEnvio);
                // Adicionar o e-mail atual à lista de enviados
                this.emailsEnviados.push({ email, timestamp: momentoAtual });
            }
            // Opções do e-mail
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: subjectText,
                html: emailContent,
            };
            // Enviar o e-mail
            const envio = yield transporter.sendMail(mailOptions);
            return !!envio;
        });
    }
    getDefaultEmailTemplate(propietario, empresa, token, tipoRotaEnvio) {
        let rotaEnvio = 'ConfirmarCadastro';
        let layoutEmail = `
          <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <header style="background-color: #FFF; padding: 20px;">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvV804ZTmDRXUG4cxSodfy6fGW5Jin9hb9ZA&s" alt="Logo" style="max-width: 100%; height: auto;">
          </header>
          <main style="padding: 20px;">
            <h1 style="color: #007bff;">${propietario}, <br> Obrigado por escolher o <strong>RUBY - MicroFolha!</strong></h1>
            <p style="font-size: 16px; color: #666; font-weight: bold;">
              Estamos muito felizes em tê-lo conosco! Para completar o cadastro da sua empresa ${empresa} e começar a aproveitar todos os nossos benefícios, clique no botão abaixo:
            </p>
            <a href="https://projeto-ruby-front-end.vercel.app/${rotaEnvio}?token=${token}" 
              style="display: inline-block; margin: 20px auto; padding: 15px 25px; color: #fff; background-color: #007bff; border-radius: 5px; text-decoration: none; font-size: 16px;">
              Confirmar Plano
            </a>
            <p style="margin-top: 20px; font-size: 14px; color: #999;">
              Se você não solicitou esta ação, ignore este e-mail.
            </p>
          </main> 
          <footer style="background-color: #f1f1f1; padding: 10px; font-size: 12px; color: #666;">
            © 2024 RUBY - MICROFOLHA. Todos os direitos reservados.
          </footer>
        </div>
      </div>
    `;
        if (tipoRotaEnvio === '2') {
            rotaEnvio = 'ConfirmarCadastro2';
            layoutEmail = `
          <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <header style="background-color: #FFF; padding: 20px;">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvV804ZTmDRXUG4cxSodfy6fGW5Jin9hb9ZA&s" alt="Logo" style="max-width: 100%; height: auto;">
          </header>
          <main style="padding: 20px;">
            <h1 style="color: #007bff;">${propietario}, <br> Bem Vindo de Volta ao <strong>RUBY - MicroFolha!</strong></h1>
            <p style="font-size: 16px; color: #666; font-weight: bold;">
              Estamos muito felizes em tê-lo mais uma vez! Já possuímos o cadastro da sua empresa ${empresa}. Apenas Confirme seu Plano e volte a aproveitar todos os nossos benefícios, clique no botão abaixo:
            </p>
            <a href="https://projeto-ruby-front-end.vercel.app/${rotaEnvio}?token=${token}" 
              style="display: inline-block; margin: 20px auto; padding: 15px 25px; color: #fff; background-color: #007bff; border-radius: 5px; text-decoration: none; font-size: 16px;">
              Confirmar Plano
            </a>
            <p style="margin-top: 20px; font-size: 14px; color: #999;">
              Se você não solicitou esta ação, ignore este e-mail.
            </p>
          </main> 
          <footer style="background-color: #f1f1f1; padding: 10px; font-size: 12px; color: #666;">
            © 2024 RUBY - MICROFOLHA. Todos os direitos reservados.
          </footer>
        </div>
      </div>
    `;
        }
        return layoutEmail;
    }
    getCnpjInvalidEmailTemplate() {
        return `
    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <header style="background-color: #FFF; padding: 20px;">
          <h1 style="color: #007bff;">Ooops! Não Conseguimos Validar seu CNPJ 😔</h1>
        </header>
        <main style="padding: 20px;">
          <p style="font-size: 16px; color: #666;">
            O CNPJ fornecido é inválido. Por favor, Verifique os dados no seu RUBY e tente novamente.
          </p>
      <p style="margin-top: 20px; font-size: 14px; color: #999;">
        Se você não solicitou esta ação, ignore este e-mail.
      </p>
        </main>
        <footer style="padding: 10px; background: #f1f1f1;">© 2024 RUBY - MICROFOLHA</footer>
      </div>
    </div>
    `;
    }
}
exports.EnvioDeEmailConfirmacaoService = EnvioDeEmailConfirmacaoService;
