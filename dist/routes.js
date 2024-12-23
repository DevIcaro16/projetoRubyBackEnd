"use strict";
//Arquivo de roteamento com o Express:
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const envioDeEmailConfirmacaoController_1 = require("./controllers/User/envioDeEmailConfirmacaoController");
const verificarTokenController_1 = require("./controllers/User/verificarTokenController");
const verificarTokenFinalController_1 = require("./controllers/User/verificarTokenFinalController");
const confirmarPlanoController_1 = require("./controllers/User/confirmarPlanoController");
const ValidarPlanoController_1 = require("./controllers/User/ValidarPlanoController");
const ResgatarPlanosController_1 = require("./controllers/User/ResgatarPlanosController");
const axios_1 = __importDefault(require("axios"));
//Importando o Controller para utilizá-lo nas rotas:
const router = (0, express_1.Router)();
exports.router = router;
//Routas:
router.get("/", (req, res) => {
    return res.json({
        nome: "RUBY"
    });
    // throw new Error("Erro na Requisição!");
});
// Exemplo de uso no endpoint
router.post('/envioDeEmailConfirmacao', new envioDeEmailConfirmacaoController_1.envioDeEmailConfirmacaoController().handle);
router.post('/verificarToken', new verificarTokenController_1.verificarTokenController().handle);
router.post('/confirmarPlano', new confirmarPlanoController_1.ConfirmarPlanoController().handle);
router.get('/consultarStatus/:paymentId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentId } = req.params;
        const response = yield axios_1.default.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
            },
        });
        res.json(response.data);
        console.log(response.data.external_reference);
    }
    catch (error) {
        console.error('Erro ao consultar status do pagamento:', error.message);
        res.status(500).json({ error: 'Erro ao consultar pagamento' });
    }
}));
router.post('/verificarTokenFinal', new verificarTokenFinalController_1.verificarTokenFinalController().handle);
router.post('/validarPlano', new ValidarPlanoController_1.ValidarPlanoController().handle);
router.post('/resgatarPlanosBD', new ResgatarPlanosController_1.ResgatarPlanosController().handle);
