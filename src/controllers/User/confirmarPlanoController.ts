import { Request, Response } from "express";
import { ConfirmarPlanoService } from "../../services/User/ConfirmarPlanoService";
import { mercadoPagoConfig } from "../../mercadoPagoConfig";

class ConfirmarPlanoController {
  async handle(req: Request, res: Response) {
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
      const confirmarPlano = new ConfirmarPlanoService();

      // Dados do pagamento
      const paymentData = {
        description: "Pagamento do plano",
        external_reference: `${Date.now()}`,
        notification_url: mercadoPagoConfig.notificationUrl,
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
      const pixData = await confirmarPlano.gerarPix(paymentData);

      console.log(pixData);

      const verificarPlanoExistente = await confirmarPlano.verificarPlanoExistente(userData);
      
      if(!verificarPlanoExistente){
        return res.status(403).json({
          success: false,
          message: "Já Existe Um Plano Com As Mesmas Informações, Por Favor Gere seu Plano Novamente!",
        });
      }

      // Envia e-mails
      const token = await confirmarPlano.enviarEmails(userData.LOG, userData, pixData);

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
    } catch (error) {
      console.error("Erro ao processar a requisição:", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
}

export { ConfirmarPlanoController };
