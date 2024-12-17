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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResgatarPlanosService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
class ResgatarPlanosService {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const planosBD = yield prisma_1.default.plano.findMany({
                    select: {
                        id: true,
                        max: true,
                        val: true,
                        des: true,
                        tip: true
                    }
                });
                return {
                    success: true,
                    planos: planosBD
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: error
                };
            }
        });
    }
}
exports.ResgatarPlanosService = ResgatarPlanosService;
