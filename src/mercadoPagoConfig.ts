import dotenv from "dotenv";

dotenv.config();

export const mercadoPagoConfig = {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
    notificationUrl: process.env.NOTIFICATION_URL || "https://seu-dominio.com/notification.php",
};
