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
exports.ConfirmarPlanoController = void 0;
const ConfirmarPlanoService_1 = require("../../services/User/ConfirmarPlanoService");
const mercadoPagoConfig_1 = require("../../mercadoPagoConfig");
class ConfirmarPlanoController {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requiredFields = [
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
                    "CTR",
                    "INI",
                    "FIM",
                    "MAT",
                    "EMI",
                    "DAT",
                    "VER",
                    "VAL",
                    "NOM",
                ];
                // Verificar campos obrigatórios
                const missingFields = requiredFields.filter((field) => !req.body[field]);
                if (missingFields.length > 0) {
                    return res.status(400).json({
                        error: `Os seguintes campos são obrigatórios: ${missingFields.join(", ")}`,
                    });
                }
                const userData = req.body;
                // Instancia o serviço de confirmação de plano
                const confirmarPlano = new ConfirmarPlanoService_1.ConfirmarPlanoService();
                // Dados do pagamento
                const paymentData = {
                    description: "Pagamento do plano",
                    external_reference: `${Date.now()}`,
                    notification_url: mercadoPagoConfig_1.mercadoPagoConfig.notificationUrl,
                    payer: {
                        email: userData.LOG,
                        identification: {
                            type: "CNPJ",
                            number: userData.CGC,
                        },
                    },
                    payment_method_id: "pix",
                    // transaction_amount: parseFloat(userData.VAL), // Valor dinâmico
                    transaction_amount: 0.01
                };
                // Gera PIX
                const pixData = yield confirmarPlano.gerarPix(paymentData);
                console.log(pixData);
                const verificarPlanoExistente = yield confirmarPlano.verificarPlanoExistente(userData);
                if (!verificarPlanoExistente) {
                    return res.status(403).json({
                        success: false,
                        message: "Já Existe Um Plano Com As Mesmas Informações, Por Favor Gere seu Plano Novamente!",
                    });
                }
                // Envia e-mails
                const token = yield confirmarPlano.enviarEmails(userData.LOG, userData, pixData);
                if (!token) {
                    return res.status(500).json({
                        success: false,
                        message: "Ocorreu um erro ao tentar enviar os e-mails.",
                    });
                }
                return res.status(200).json({
                    success: true,
                    token,
                    message: "E-mails enviados com sucesso e PIX gerado!",
                    pix: {
                        id: pixData.id,
                        valor: pixData.transaction_amount,
                        externalReference: pixData.external_reference,
                        qrCode: pixData.point_of_interaction.transaction_data.qr_code,
                        qrCodeImg: pixData.point_of_interaction.transaction_data.qr_code_base64,
                        link: pixData.point_of_interaction.transaction_data.ticket_url,
                    },
                });
            }
            catch (error) {
                console.error("Erro ao processar a requisição:", error);
                return res.status(500).json({ error: "Erro interno do servidor." });
            }
        });
    }
}
exports.ConfirmarPlanoController = ConfirmarPlanoController;
