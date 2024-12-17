"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = isAuthenticated;
//Método de verificação do JWT:
const jsonwebtoken_1 = require("jsonwebtoken");
//Função que conferirá a autenticação:
function isAuthenticated(req, res, next) {
    // console.log("MIDDLEWARE!");
    // Variável que guardará o token de autenticação que estará no cabeçalho / header da requisição.
    const authToken = req.headers.authorization;
    if (!authToken) {
        return res.status(401).json({
            success: false
        });
    }
    // console.log(authToken);
    //Resgatar somente o token (sem o prefixo):
    const [prefix, token] = authToken.split(" ");
    //Confere o prefixo:
    if (prefix !== "Bearer") {
        // console.log(prefix);
        res.status(401).json({
            success: false,
            message: "Prefixo Inválido!"
        });
    }
    // console.log(token);
    //Validação do Token de fato:
    try { //Sucesso na validação do token.
        //Digo que o token retornado e descriptografado (com o método verify) é igual a Interface Payload. Ou seja, contém corretamente
        // As informações do user:
        const { sub } = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET_1);
        // console.log(sub);
        // Esquema para recuperar o id do user ao longo da sessão.
        req.user_id = sub;
        //Continua o Processo:
        return next();
    }
    catch (error) { //Error na validação do token.
        //Finaliza o processo com uma resposta e um status.
        return res.status(401).end();
    }
}
