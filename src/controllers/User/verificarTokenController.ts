import { Response, Request, response } from "express";
import { verificarTokenService } from "../../services/User/verificarTokenService";

class verificarTokenController{
    async handle(req: Request, res: Response){

        const { token } = req.body;

        const verificarToken = new verificarTokenService();

        const tokenVerificado = await verificarToken.execute(token);

        if(tokenVerificado){
            res.status(200).json({ 
                valid: true,
                message: 'Token Válido.' ,
                decoded: tokenVerificado.decoded

             });
        }else{
            res.status(400).json({ 
                valid: false, 
                message: 'Token inválido.' 
            });
        }

    }
}

export { verificarTokenController };