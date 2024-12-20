import prismaClient from "../../prisma";
import nodemailer from "nodemailer"; // Para envio de emails
import { promises as fs } from "fs"; // Para manipulação de arquivos
import { config } from "dotenv"; // Para carregar variáveis de ambiente
import jwt from "jsonwebtoken";
import axios from "axios";

config(); // Carregar variáveis de ambiente

class ValidarPlanoService {

  // Função de Criptografia
  async fCrip(cTexto) {
    // Obtém a chave do arquivo .env
    const nChave = parseInt(process.env.CRYPTO_KEY, 10);
    if (isNaN(nChave)) {
      throw new Error("Erro: Chave inválida");
    }

    // Inicializa o texto criptografado
    let cTextoCriptografado = "";

    // Divide o texto em palavras
    const palavras = cTexto.split(" ");

    // Percorre cada palavra do texto original
    palavras.forEach((palavra) => {
      const nTamanhoPalavra = palavra.length;

      // Percorre cada caractere da palavra
      for (let i = 0; i < nTamanhoPalavra; i++) {
        const nCaractereOriginal = palavra.charCodeAt(i);

        // Aplica o deslocamento baseado na chave, posição da letra e tamanho da palavra
        let nCaractereCriptografado =
          (nCaractereOriginal + nChave + (i + 1) + nTamanhoPalavra) % 256;

        // Garante que o valor esteja no intervalo de caracteres ASCII
        if (nCaractereCriptografado < 0) {
          nCaractereCriptografado += 256;
        }

        // Adiciona o caractere criptografado ao resultado
        cTextoCriptografado += String.fromCharCode(nCaractereCriptografado);
      }

      // Adiciona espaço entre palavras criptografadas
      cTextoCriptografado += " ";
    });

    return cTextoCriptografado.trim();
  }

  async calcMesesPlano(date1: string, date2: string): Promise<number> {
    // Separar mês e ano
    const [month1, year1] = date1.split('/').map(Number);
    const [month2, year2] = date2.split('/').map(Number);

    // Calcular diferença em meses
    const difference = (year2 - year1) * 12 + (month2 - month1);

    return difference;
  }


  async validarToken(token: string, externalReference: string, dateApproved: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Validar o token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET_2) as {
        EMP: string;
        CGC: string;
        DES: string;
        PRP: string;
        EDR: string;
        BAI: string;
        CID: string;
        TEL: string;
        LOG: string;
        PWD: string;
        CTR: string;
        INI: string;
        FIM: string;
        MAT: string;
        EMI: string;
        DAT: string;
        VER: string;
        VAL: string;
      };

      // Exibindo o conteúdo decodificado para debug
      console.log("Token Decodificado:", decoded);

      // 2. Criar um arquivo TXT com as informações do cliente
      const filePath =await this.criarArquivo(decoded, externalReference, dateApproved);
      console.log("FILE PATH: " + filePath);

      // 1. Enviar e-mail para o cliente confirmando a criação do plano
      await this.enviarEmail(decoded.LOG, decoded, filePath);

      console.log(token);


      return { success: true, message: "Token válido e processos realizados com sucesso." };
    } catch (error) {
      console.error("Erro ao validar token:", error);
      console.log(token);
      return { success: false, message: "Token inválido ou expirado." };
    }
  }

  private async enviarEmail(email: string, userData: any, filePath: any): Promise<void> {
    const transporter = nodemailer.createTransport({
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

    await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado para o cliente: ${email}`);
  }

  async formatarData(dataIso: string): Promise<string> {
    const data = new Date(dataIso); // Converte a string para um objeto Date
    
    const dia = String(data.getUTCDate()).padStart(2, '0'); // Pega o dia
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0'); // Pega o mês (0 indexado)
    const ano = data.getUTCFullYear(); // Pega o ano completo
    
    return `${dia}/${mes}/${ano}`;
  }
  


private async criarArquivo(userData: any, externalReference: string, dateApproved: string): Promise<any> {

    const { EMP, CGC, DES, PRP, EDR, BAI, CID, TEL, LOG, PWD, CTR, INI, FIM, MAT, EMI, DAT, VER, VAL } = userData;

    // Verifica se o cliente já existe pelo CGC (CNPJ)
    let cliente = await prismaClient.cliente.findFirst({
      where: {
        cgc: CGC
      }
    });

    // Caso não exista, cria o novo cliente
    if (!cliente) {
      cliente = await prismaClient.cliente.create({
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
          sta: "ATIVO"
        }
      });

      console.log("Cliente cadastrado com sucesso!");
    } else {
      console.log("Cliente já existe no banco de dados!");
    }

    // Recupera o ID do cliente (seja existente ou recém-criado)
    const clienteId = cliente.id;
    console.log(`ID do Cliente: ${clienteId}`);

    // Conteúdo base (inserção de ID no TXT)
    let conteudoBase = `
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
        <PWD>${PWD}</PWD>
        <CTR>${CTR}</CTR>
        <INI>${INI}</INI>
        <FIM>${FIM}</FIM>
        <MAT>${MAT}</MAT>
        <EMI>${EMI}</EMI>
        <DAT>${DAT}</DAT>
        <VER>${VER}</VER>
        <VAL>${VAL}</VAL>
    </lib>`.trim();

    // Conteúdo completo do arquivo TXT (com SHA)
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
        <PWD>${PWD}</PWD>
        <CTR>${CTR}</CTR>
        <INI>${INI}</INI>
        <FIM>${FIM}</FIM>
        <MAT>${MAT}</MAT>
        <EMI>${EMI}</EMI>
        <DAT>${DAT}</DAT>
        <VER>${VER}</VER>
        <VAL>${VAL}</VAL>
        <SHA>
    ${conteudoBase.replace(/<lib>|<\/lib>/g, '').replace(/^/gm, '        ')}
        </SHA>
    </lib>`.trim();

    console.log(`Conteúdo Arquivo TXT: ${conteudoArquivoTxt}`);

    // Criptografando o conteúdo do arquivo
    const conteudoArquivoCrip = await this.fCrip(conteudoArquivoTxt);

    // Calcula meses do plano e formata data
    const calcMesesPlano = await this.calcMesesPlano(INI, FIM);
    const dataReaFormat = await this.formatarData(dateApproved);

    // Criação do registro de plano no banco de dados
    const criarPlano = await prismaClient.pagamento.create({
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
        ref: externalReference
      },
    });

    const nomeArquivo = `LIB_${CGC}.txt`;
    const caminhoArquivo = `src/tmp/${nomeArquivo}`;

    // Verifica se a pasta existe, caso contrário, cria
    try {
      await fs.mkdir('src/tmp', { recursive: true });
      console.log('Pasta tmp criada ou já existe');
    } catch (err) {
      console.error('Erro ao criar a pasta tmp:', err);
    }

    // Salvando o arquivo TXT criptografado
    await fs.writeFile(caminhoArquivo, conteudoArquivoCrip, "utf-8");
    console.log("Arquivo TXT criado com sucesso:", caminhoArquivo);

    // Envio do arquivo para o servidor externo
    try {
      const url = "http://www.micromoney.com.br/ruby/lic/liberacao.php";
      const response = await axios.post(
        url,
        { fileName: nomeArquivo, warq: conteudoArquivoCrip },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log(`Arquivo enviado com sucesso! Resposta do servidor:`, response.data);

    } catch (error) {
      console.error("Erro ao enviar o arquivo:", error.message);
    }

    if (criarPlano) {
      console.log(`Registro de Plano criado com sucesso!`);
    }

    return caminhoArquivo;
}


}

export { ValidarPlanoService };
