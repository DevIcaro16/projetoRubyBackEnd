import { Response, Request, response } from "express";
import { verificarTokenFinalService } from "../../services/User/verificarTokenFinalService";

class verificarTokenFinalController{
    async handle(req: Request, res: Response){

        const { token } = req.body;

        const verificarToken = new verificarTokenFinalService();

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

export { verificarTokenFinalController };