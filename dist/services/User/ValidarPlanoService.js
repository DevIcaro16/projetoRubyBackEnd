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
exports.ValidarPlanoService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const nodemailer_1 = __importDefault(require("nodemailer")); // Para envio de emails
const fs_1 = require("fs"); // Para manipulação de arquivos
const dotenv_1 = require("dotenv"); // Para carregar variáveis de ambiente
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const buffer_1 = require("buffer");
(0, dotenv_1.config)(); // Carregar variáveis de ambiente
class ValidarPlanoService {
    // Função de Criptografia
    fCrip(text) {
        return __awaiter(this, void 0, void 0, function* () {
            // Obtém a chave do arquivo .env
            const key = process.env.CRYPTO_KEY;
            if (!key) {
                throw new Error("Erro: Chave inválida ou não definida.");
            }
            // Inicializa o texto criptografado
            let encryptedText = "";
            // Percorre cada caractere do texto
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                encryptedText += String.fromCharCode(charCode);
            }
            // Codifica o texto criptografado em Base64
            const base64Encoded = buffer_1.Buffer.from(encryptedText, "binary").toString("base64");
            return base64Encoded;
        });
    }
    calcMesesPlano(date1, date2) {
        return __awaiter(this, void 0, void 0, function* () {
            // Separar mês e ano
            const [month1, year1] = date1.split('/').map(Number);
            const [month2, year2] = date2.split('/').map(Number);
            // Calcular diferença em meses
            const difference = (year2 - year1) * 12 + (month2 - month1);
            return difference;
        });
    }
    validarToken(token, externalReference, dateApproved) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validar o token JWT
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_2);
                // Exibindo o conteúdo decodificado para debug
                console.log("Token Decodificado:", decoded);
                // 2. Criar um arquivo TXT com as informações do cliente
                const filePath = yield this.criarArquivo(decoded, externalReference, dateApproved);
                console.log("FILE PATH: " + filePath);
                // 1. Enviar e-mail para o cliente confirmando a criação do plano
                yield this.enviarEmail(decoded.LOG, decoded, filePath);
                console.log(token);
                return { success: true, message: "Token válido e processos realizados com sucesso." };
            }
            catch (error) {
                console.error("Erro ao validar token:", error);
                console.log(token);
                return { success: false, message: "Token inválido ou expirado." };
            }
        });
    }
    enviarEmail(email, userData, filePath) {
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
            const textEmail = `
<div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; text-align: center;">
  <div style="max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <header style="background-color: #007BFF; padding: 20px;">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvV804ZTmDRXUG4cxSodfy6fGW5Jin9hb9ZA&s" alt="Logo" style="max-width: 150px; height: auto; margin: auto;">
    </header>
    <main style="padding: 20px;">
      <h1 style="color: #333; font-size: 24px;">Plano Criado com Sucesso!</h1>
      <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
        Prezado(a) <b>${userData.PRP}</b>, o seu plano foi criado com sucesso! Seguem os detalhes abaixo:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f2f2f2;">
          <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Descrição</th>
          <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Detalhe</th>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Nome da Empresa</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${userData.DES}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">CNPJ</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${userData.CGC}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Período</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${userData.INI} até ${userData.FIM}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Forma de Pagamento</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">PIX</td>
        </tr>
        <tr>
          <td style="padding: 10px;">Valor Total</td>
          <td style="padding: 10px;">R$ ${userData.VAL.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Quantidade De Funcionários</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${userData.MAT}</td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #666;">
        <b>Importante:</b> Faça a importação da sua licença no sistema RUBY e aproveite todos os benefícios do plano.
      </p>
    </main>
    <footer style="background-color: #f1f1f1; padding: 10px; font-size: 12px; color: #666;">
      <p>© 2024 Micro&Money - Softwares Inteligentes. Todos os direitos reservados.</p>
      <p>
        Caso tenha dúvidas, entre em contato conosco:
        <br>Telefone: (85) 99607-1621
        <br>E-mail: micromoneyprogramacao@gmail.com
      </p>
    </footer>
  </div>
</div>

    `;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Plano RUBY - MicroFolha Criado!",
                html: textEmail,
                attachments: [
                    {
                        filename: `LIB_${userData.CGC}.txt`,
                        path: filePath, // Caminho para o arquivo   
                    },
                ]
            };
            yield transporter.sendMail(mailOptions);
            console.log(`E-mail enviado para o cliente: ${email}`);
        });
    }
    formatarData(dataIso) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = new Date(dataIso); // Converte a string para um objeto Date
            const dia = String(data.getUTCDate()).padStart(2, '0'); // Pega o dia
            const mes = String(data.getUTCMonth() + 1).padStart(2, '0'); // Pega o mês (0 indexado)
            const ano = data.getUTCFullYear(); // Pega o ano completo
            return `${dia}/${mes}/${ano}`;
        });
    }
    criarArquivo(userData, externalReference, dateApproved) {
        return __awaiter(this, void 0, void 0, function* () {
            const { EMP, CGC, DES, PRP, EDR, BAI, CID, TEL, LOG, PWD, CTR, INI, FIM, MAT, EMI, DAT, VER, VAL } = userData;
            // Verifica se o cliente já existe pelo CGC (CNPJ)
            let cliente = yield prisma_1.default.cliente.findFirst({
                where: {
                    cgc: CGC,
                },
            });
            // Caso não exista, cria o novo cliente
            if (!cliente) {
                cliente = yield prisma_1.default.cliente.create({
                    data: {
                        emp: EMP,
                        cgc: CGC,
                        des: DES,
                        tel: TEL,
                        edr: EDR,
                        bai: BAI,
                        cid: CID,
                        ema: LOG,
                        pwd: PWD,
                        sta: "ATIVO",
                    },
                });
                console.log("Cliente cadastrado com sucesso!");
            }
            else {
                console.log("Cliente já existe no banco de dados!");
            }
            // Recupera o ID do cliente (seja existente ou recém-criado)
            const clienteId = cliente.id;
            console.log(`ID do Cliente: ${clienteId}`);
            const pwdCrip = this.fCrip(PWD);
            // Conteúdo base (somente informações do plano dentro da tag <SHA>)
            let conteudoBase = `
    <CTR>${CTR}</CTR>
    <INI>${INI}</INI>
    <FIM>${FIM}</FIM>
    <MAT>${MAT}</MAT>
    <EMI>${EMI}</EMI>
    <DAT>${DAT}</DAT>
    <VER>${VER}</VER>
    <VAL>${VAL}</VAL>
    `.trim();
            // Conteúdo completo do arquivo TXT
            let conteudoArquivoTxt = `
    <lib>
    <EMP>${clienteId}</EMP>
    <CGC>${CGC}</CGC>
    <DES>${DES}</DES>
    <PRP>${PRP}</PRP>
    <EDR>${EDR}</EDR>
    <BAI>${BAI}</BAI>
    <CID>${CID}</CID>
    <TEL>${TEL}</TEL>
    <LOG>${LOG}</LOG>
    <PWD>${pwdCrip}</PWD>
    <SHA>${conteudoBase}</SHA>
    </lib>
    `.replace(/\s*\n\s*/g, ""); // Remove linhas em branco
            console.log(`Conteúdo Arquivo TXT: ${conteudoArquivoTxt}`);
            // Criptografando o conteúdo do arquivo
            const conteudoArquivoCrip = yield this.fCrip(conteudoArquivoTxt);
            // Calcula meses do plano e formata data
            const calcMesesPlano = yield this.calcMesesPlano(INI, FIM);
            const dataReaFormat = yield this.formatarData(dateApproved);
            // Criação do registro de plano no banco de dados
            const criarPlano = yield prisma_1.default.pagamento.create({
                data: {
                    cgc: CGC,
                    lib: conteudoArquivoTxt,
                    dsc: 0,
                    pag: VAL,
                    emi: EMI,
                    dat: DAT,
                    rea: dataReaFormat,
                    mestot: calcMesesPlano,
                    ini: INI,
                    fim: FIM,
                    mat: MAT,
                    met: "PIX",
                    sta: "ATIVO",
                    ref: externalReference,
                },
            });
            const nomeArquivo = `LIB_${CGC}.txt`;
            const caminhoTmp = path_1.default.join("/tmp", nomeArquivo);
            // Salvando o arquivo TXT criptografado
            try {
                yield fs_1.promises.writeFile(caminhoTmp, conteudoArquivoCrip, "utf-8");
                console.log("Arquivo TXT criado com sucesso:", caminhoTmp);
            }
            catch (err) {
                console.error("Erro ao criar o arquivo TXT:", err);
                throw new Error("Não foi possível criar o arquivo TXT.");
            }
            // Envio do arquivo para o servidor externo
            try {
                const url = "http://www.micromoney.com.br/ruby/lic/liberacao.php";
                const response = yield axios_1.default.post(url, { fileName: nomeArquivo, warq: conteudoArquivoCrip }, { headers: { "Content-Type": "application/json" } });
                console.log(`Arquivo enviado com sucesso! Resposta do servidor:`, response.data);
            }
            catch (error) {
                console.error("Erro ao enviar o arquivo:", error.message);
            }
            if (criarPlano) {
                console.log(`Registro de Plano criado com sucesso!`);
            }
            return caminhoTmp;
        });
    }
}
exports.ValidarPlanoService = ValidarPlanoService;
