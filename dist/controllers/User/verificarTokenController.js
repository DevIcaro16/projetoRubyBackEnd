"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarTokenController = void 0;
const verificarTokenService_1 = require("../../services/User/verificarTokenService");
class verificarTokenController {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.body;
            const verificarToken = new verificarTokenService_1.verificarTokenService();
            const tokenVerificado = yield verificarToken.execute(token);
            if (tokenVerificado) {
                res.status(200).json({
                    valid: true,
                    message: 'Token Válido.',
                    decoded: tokenVerificado.decoded
                });
            }
            else {
                res.status(400).json({
                    valid: false,
                    message: 'Token inválido.'
                });
            }
        });
    }
}
exports.verificarTokenController = verificarTokenController;
