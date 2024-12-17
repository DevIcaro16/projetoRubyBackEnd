-- CreateTable
CREATE TABLE `rub_emp` (
    `id` VARCHAR(191) NOT NULL,
    `emp` VARCHAR(191) NOT NULL,
    `cgc` VARCHAR(191) NOT NULL,
    `des` VARCHAR(191) NOT NULL,
    `tel` VARCHAR(191) NOT NULL,
    `edr` VARCHAR(191) NOT NULL,
    `bai` VARCHAR(191) NOT NULL,
    `cid` VARCHAR(191) NOT NULL,
    `ema` VARCHAR(191) NOT NULL,
    `pwd` VARCHAR(191) NOT NULL,
    `creat_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `plano_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rub_pla` (
    `id` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `lib` VARCHAR(191) NOT NULL,
    `max` VARCHAR(191) NOT NULL,
    `val` VARCHAR(191) NOT NULL,
    `dsc` DOUBLE NOT NULL,
    `pag` DOUBLE NOT NULL,
    `emi` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dat` VARCHAR(191) NOT NULL,
    `rea` VARCHAR(191) NOT NULL,
    `ini` VARCHAR(191) NOT NULL,
    `fim` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cliente_id` VARCHAR(191) NULL,
    `pagamento_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id` VARCHAR(191) NOT NULL,
    `cliente_id` VARCHAR(191) NOT NULL,
    `plano_id` VARCHAR(191) NULL,
    `valor` DOUBLE NOT NULL,
    `metodo_pagamento` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `referencia_externa` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rub_emp` ADD CONSTRAINT `rub_emp_plano_id_fkey` FOREIGN KEY (`plano_id`) REFERENCES `rub_pla`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `rub_emp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_plano_id_fkey` FOREIGN KEY (`plano_id`) REFERENCES `rub_pla`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
