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
Object.defineProperty(exports, "__esModule", { value: true });
exports.envioDeEmailConfirmacaoController = void 0;
const envioDeEmailConfirmacaoService_1 = require("../../services/User/envioDeEmailConfirmacaoService");
class envioDeEmailConfirmacaoController {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { file } = req.body;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhum arquivo foi enviado. Por favor, forneça um arquivo válido.'
                });
            }
            function decrypt(encryptedText, key) {
                // Decodifica o texto de Base64
                const decodedText = atob(encryptedText);
                let decryptedText = '';
                for (let i = 0; i < decodedText.length; i++) {
                    const charCode = decodedText.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                    decryptedText += String.fromCharCode(charCode);
                }
                return decryptedText;
            }
            try {
                const secretKey = process.env.CRYPTO_KEY;
                // Decodifica o conteúdo do arquivo Base64
                const decodedContent = decrypt(file, secretKey); // `file` é o conteúdo criptografado recebido
                console.log("Arquivo decodificado:", decodedContent);
                const envioDeEmailConfirmacao = new envioDeEmailConfirmacaoService_1.EnvioDeEmailConfirmacaoService();
                // Extração de tags do conteúdo do arquivo
                const extractedData = yield envioDeEmailConfirmacao.extractTags(decodedContent);
                console.log(JSON.stringify(extractedData));
                if (!extractedData['LOG'] || !extractedData['PRP'] || !extractedData['DES'] || !extractedData['CGC']) {
                    return res.status(400).json({
                        success: false,
                        message: 'O arquivo enviado está incompleto ou possui dados inválidos.',
                    });
                }
                const extractedDataEmail = extractedData['LOG'];
                const extractedDataPropietario = extractedData['PRP'];
                let extractedDataEmpresa = extractedData['DES'];
                const extractedDataCNPJ = extractedData['CGC'];
                // const extractedDataIDY = extractedData['IDY'];
                console.log(`EMAIL: ${extractedDataEmail}`);
                console.log(`PROPRIETÁRIO: ${extractedDataPropietario}`);
                console.log(`EMPRESA: ${extractedDataEmpresa}`);
                console.log(`CNPJ: ${extractedDataCNPJ}`);
                // console.log(`IDY: ${extractedDataIDY}`);
                // Gera o token JWT
                // Valida o CNPJ na Receita Federal
                const empresaValida = yield envioDeEmailConfirmacao.checkCnpj(extractedDataPropietario, extractedDataCNPJ, extractedDataEmail);
                if (empresaValida) {
                    extractedData['DES'] = empresaValida;
                    console.log(extractedData['DES']);
                }
                else {
                    return res.status(400).json({
                        success: false,
                        message: 'O CNPJ fornecido é inválido ou não encontrado na Receita Federal.',
                    });
                }
                let tokenEmail = yield envioDeEmailConfirmacao.generateToken(extractedData);
                let verificarCliente = yield envioDeEmailConfirmacao.checkCliente(extractedDataCNPJ);
                // Envia o e-mail de confirmação
                const emailEnviado = yield envioDeEmailConfirmacao.enviarEmail(extractedDataEmail, extractedDataPropietario, extractedDataEmpresa, tokenEmail, "", verificarCliente);
                if (emailEnviado) {
                    return res.json({
                        success: true,
                        token: tokenEmail,
                        message: 'E-mail de confirmação enviado com sucesso!',
                    });
                }
                else {
                    throw new Error('Erro ao enviar o e-mail de confirmação.');
                }
            }
            catch (error) {
                console.error('Erro no envio de e-mail de confirmação:', error.message || error);
                res.status(500).json({
                    success: false,
                    message: 'Ocorreu um erro ao processar os dados. Tente novamente mais tarde.',
                    error: error.message || error,
                });
            }
        });
    }
}
exports.envioDeEmailConfirmacaoController = envioDeEmailConfirmacaoController;
