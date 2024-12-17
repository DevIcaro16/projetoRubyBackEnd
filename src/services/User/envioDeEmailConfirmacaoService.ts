import prismaClient from "../../prisma";
import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import axios from "axios";

config();

class EnvioDeEmailConfirmacaoService {
  // Função para extrair os dados das tags
  async extractTags(content: string) {
    const extractedData: Record<string, string> = {};
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
  }

  async generateToken(data: object): Promise<string> {
    return jwt.sign(data, process.env.JWT_SECRET_1 as string, { expiresIn: "1h" });
  }

  async checkCnpj(proprietario: string, cnpj: string, email: string): Promise<string | void> {
    try {
      const formattedCnpj = cnpj.replace(/\D/g, "");
      const url = `https://www.receitaws.com.br/v1/cnpj/${formattedCnpj}`;
      const response = await axios.get(url);
      const { nome, status } = response.data;

      if (status === "OK" && nome) {
        console.log(nome);
        return nome;
      } else {
        await this.enviarEmail(
          email,
          proprietario,
          "Ooops! Não Conseguimos Validar Seu CNPJ.",
          "Volte ao seu RUBY e tente novamente",
          this.getCnpjInvalidEmailTemplate()
        );
        throw new Error("CNPJ inválido ou não encontrado.");
      }
    } catch (error: any) {
      console.error("Erro ao validar o CNPJ:", error.message);
      throw new Error("Erro ao validar o CNPJ.");
    }
  }

  async checkCliente(CGC: string): Promise<string>{
    let cliente = await prismaClient.cliente.findFirst({
      where: {
        cgc: CGC
      }
    });

    if(!cliente){
      return "1";
    }else{
      return "2";
    }
  }

  async enviarEmail( email: string, 
                     propietario: string,
                     empresa: string,
                     token: string = "",
                     emailTemplate?: string,
                     tipoRotaEnvio?: string
  ): Promise<boolean> {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const emailsEnviados: { email: string; timestamp: number }[] = [];
    const intervaloEntreEmails = 5 * 60 * 1000;
    const momentoAtual = Date.now();

    emailsEnviados.forEach((item, index) => {
      if (momentoAtual - item.timestamp > intervaloEntreEmails) {
        emailsEnviados.splice(index, 1);
      }
    });

    if (emailsEnviados.some((item) => item.email === email)) {
      throw new Error(
        "Email já enviado! Aguarde 5 minutos antes de reenviar."
      );
    }

    const defaultEmailTemplate = this.getDefaultEmailTemplate(
      propietario,
      empresa,
      token,
      tipoRotaEnvio
    );
    const emailContent = emailTemplate || defaultEmailTemplate;

    let subjectText = `Olá, ${propietario}! Confirme o seu Plano RUBY`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subjectText,
      html: emailContent,
    };

    const envio = await transporter.sendMail(mailOptions);
    return !!envio;

    
  }

  

  private getDefaultEmailTemplate(
    propietario: string,
    empresa: string,
    token: string,
    tipoRotaEnvio: string
  ): string {

    let rotaEnvio: string = 'ConfirmarCadastro';

    

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
            <a href="http://192.168.56.1:3000/${rotaEnvio}?token=${token}" 
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

    if(tipoRotaEnvio === '2'){
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
            <a href="http://192.168.56.1:3000/${rotaEnvio}?token=${token}" 
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

  private getCnpjInvalidEmailTemplate(): string {
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

export { EnvioDeEmailConfirmacaoService };
