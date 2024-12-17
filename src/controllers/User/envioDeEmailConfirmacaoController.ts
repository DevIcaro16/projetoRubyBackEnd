import { Response, Request } from "express";
import { EnvioDeEmailConfirmacaoService } from "../../services/User/envioDeEmailConfirmacaoService";

class envioDeEmailConfirmacaoController {
    async handle(req: Request, res: Response) {

        const { file } = req.body;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo foi enviado. Por favor, forneça um arquivo válido.'
            });
        }

        try {
            // Decodifica o conteúdo do arquivo Base64
            const decodedContent = Buffer.from(file, 'base64').toString('utf-8');
            console.log("Arquivo decodificado:", decodedContent);

            const envioDeEmailConfirmacao = new EnvioDeEmailConfirmacaoService();

            // Extração de tags do conteúdo do arquivo
            const extractedData = await envioDeEmailConfirmacao.extractTags(decodedContent);

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

            console.log(`EMAIL: ${extractedDataEmail}`);
            console.log(`PROPRIETÁRIO: ${extractedDataPropietario}`);
            console.log(`EMPRESA: ${extractedDataEmpresa}`);
            console.log(`CNPJ: ${extractedDataCNPJ}`);

            // Gera o token JWT

            // Valida o CNPJ na Receita Federal
            const empresaValida = await envioDeEmailConfirmacao.checkCnpj(extractedDataPropietario, extractedDataCNPJ, extractedDataEmail);

            if (empresaValida) {
                extractedData['DES'] = empresaValida;
                console.log(extractedData['DES']);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'O CNPJ fornecido é inválido ou não encontrado na Receita Federal.',
                });
            }

            let tokenEmail = await envioDeEmailConfirmacao.generateToken(extractedData);

            let verificarCliente = await envioDeEmailConfirmacao.checkCliente(extractedDataCNPJ);


            // Envia o e-mail de confirmação
            const emailEnviado = await envioDeEmailConfirmacao.enviarEmail(
                extractedDataEmail,
                extractedDataPropietario,
                extractedDataEmpresa,
                tokenEmail,
                "",
                verificarCliente
            );

            if (emailEnviado) {
                return res.json({
                    success: true,
                    token: tokenEmail,
                    message: 'E-mail de confirmação enviado com sucesso!',
                });
            } else {
                throw new Error('Erro ao enviar o e-mail de confirmação.');
            }

        } catch (error: any) {
            console.error('Erro no envio de e-mail de confirmação:', error.message || error);
            res.status(500).json({
                success: false,
                message: 'Ocorreu um erro ao processar os dados. Tente novamente mais tarde.',
                error: error.message || error,
            });
        }
    }
}

export { envioDeEmailConfirmacaoController };
