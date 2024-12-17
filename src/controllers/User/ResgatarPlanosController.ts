import { Request, Response, response } from "express";
import { ResgatarPlanosService } from "../../services/User/resgatarPlanosService";

class ResgatarPlanosController{
    async handle(req: Request, res: Response){
        const resgatarPlanosService = new ResgatarPlanosService();

        const planos = await resgatarPlanosService.execute();

        res.status(200).json(planos);

    }
}

export { ResgatarPlanosController };