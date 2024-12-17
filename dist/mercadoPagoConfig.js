"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mercadoPagoConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.mercadoPagoConfig = {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
    notificationUrl: process.env.NOTIFICATION_URL || "https://seu-dominio.com/notification.php",
};
