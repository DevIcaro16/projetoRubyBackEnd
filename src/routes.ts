//Arquivo de roteamento com o Express:

import { Router } from "express";
import { Request, Response, response } from "express";
import { envioDeEmailConfirmacaoController } from "./controllers/User/envioDeEmailConfirmacaoController";
import { verificarTokenController } from "./controllers/User/verificarTokenController";
import { verificarTokenFinalController } from "./controllers/User/verificarTokenFinalController";
import { ConfirmarPlanoController } from "./controllers/User/confirmarPlanoController";
import { ValidarPlanoController } from "./controllers/User/ValidarPlanoController";
import { ResgatarPlanosController } from "./controllers/User/ResgatarPlanosController";
import axios from "axios";

//Importando o Controller para utilizá-lo nas rotas:


const router = Router();

//Routas:

router.get("/", (req: Request, res: Response): Response => {
    return res.json({
        nome: "RUBY"
    });

    // throw new Error("Erro na Requisição!");
});



// Exemplo de uso no endpoint
router.post('/envioDeEmailConfirmacao', new envioDeEmailConfirmacaoController().handle);

router.post('/verificarToken', new verificarTokenController().handle);

router.post('/confirmarPlano', new ConfirmarPlanoController().handle);

router.get('/consultarStatus/:paymentId', async (req: Request, res: Response) => {
    try {
        const { paymentId } = req.params;

        const response = await axios.get(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                },
            }
        );

        res.json(response.data);
        console.log(response.data.external_reference);

    } catch (error) {
        console.error('Erro ao consultar status do pagamento:', error.message);
        res.status(500).json({ error: 'Erro ao consultar pagamento' });
    }
});



router.post('/verificarTokenFinal', new verificarTokenFinalController().handle);

router.post('/validarPlano', new ValidarPlanoController().handle);

router.post('/resgatarPlanosBD', new ResgatarPlanosController().handle);


export { router };
