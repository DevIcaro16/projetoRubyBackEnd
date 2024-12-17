-- CreateTable
CREATE TABLE `clientes` (
    `id` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `empresa` VARCHAR(191) NOT NULL,
    `localizacao` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `creat_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `plano_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planos` (
    `id` VARCHAR(191) NOT NULL,
    `token_liberacao` VARCHAR(191) NOT NULL,
    `valor_plano` VARCHAR(191) NOT NULL,
    `quant_funcionarios` VARCHAR(191) NOT NULL,
    `mes_referencia_compra` VARCHAR(191) NOT NULL,
    `mes_referencia_vencimento` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cliente_id` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_plano_id_fkey` FOREIGN KEY (`plano_id`) REFERENCES `planos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
