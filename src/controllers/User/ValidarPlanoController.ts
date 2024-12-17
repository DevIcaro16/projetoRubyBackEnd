import { Request, Response, response } from "express";
import { ValidarPlanoService } from "../../services/User/ValidarPlanoService";

class ValidarPlanoController{
    async handle(req: Request, res: Response){

        const { token, externalReference, dateApproved } = req.body;

        const validarPlanoService = new ValidarPlanoService();

        const planoValidado = validarPlanoService.validarToken(token, externalReference, dateApproved);

        console.log((await planoValidado).success); 

        if((await planoValidado).success){
            res.status(200).json({
                success: true,
                planoValidado
            });
        }else{
            res.status(400).json({
                success: false,
            });
        }
    }
}

export { ValidarPlanoController };