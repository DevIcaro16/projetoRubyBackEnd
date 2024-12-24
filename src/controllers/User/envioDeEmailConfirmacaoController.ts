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

            const secretKey = 'rubymicromoney2025';
            
            // Decodifica o conteúdo do arquivo Base64
            const decodedContent= decrypt(file, secretKey); // `file` é o conteúdo criptografado recebido
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
