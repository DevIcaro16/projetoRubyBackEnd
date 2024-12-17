/*
  Warnings:

  - You are about to drop the column `plano_id` on the `rub_emp` table. All the data in the column will be lost.
  - You are about to drop the column `cliente_id` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `cnpj` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `dat` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `dsc` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `emi` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `fim` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `ini` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `lib` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `pag` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `pagamento_id` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `rea` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `rub_pla` table. All the data in the column will be lost.
  - You are about to alter the column `max` on the `rub_pla` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `val` on the `rub_pla` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - You are about to drop the `pagamentos` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `creat_at` on table `rub_emp` required. This step will fail if there are existing NULL values in that column.
  - Made the column `update_at` on table `rub_emp` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `des` to the `rub_pla` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_at` to the `rub_pla` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `pagamentos` DROP FOREIGN KEY `pagamentos_cliente_id_fkey`;

-- DropForeignKey
ALTER TABLE `pagamentos` DROP FOREIGN KEY `pagamentos_plano_id_fkey`;

-- DropForeignKey
ALTER TABLE `rub_emp` DROP FOREIGN KEY `rub_emp_plano_id_fkey`;

-- AlterTable
ALTER TABLE `rub_emp` DROP COLUMN `plano_id`,
    MODIFY `creat_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `update_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `rub_pla` DROP COLUMN `cliente_id`,
    DROP COLUMN `cnpj`,
    DROP COLUMN `created_at`,
    DROP COLUMN `dat`,
    DROP COLUMN `dsc`,
    DROP COLUMN `emi`,
    DROP COLUMN `fim`,
    DROP COLUMN `ini`,
    DROP COLUMN `lib`,
    DROP COLUMN `pag`,
    DROP COLUMN `pagamento_id`,
    DROP COLUMN `rea`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `creat_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `des` VARCHAR(191) NOT NULL,
    ADD COLUMN `tip` VARCHAR(191) NULL,
    ADD COLUMN `update_at` DATETIME(3) NOT NULL,
    MODIFY `max` INTEGER NOT NULL,
    MODIFY `val` DOUBLE NOT NULL;

-- DropTable
DROP TABLE `pagamentos`;

-- CreateTable
CREATE TABLE `rub_pag` (
    `id` VARCHAR(191) NOT NULL,
    `cgc` VARCHAR(191) NOT NULL,
    `lib` VARCHAR(191) NOT NULL,
    `dsc` DOUBLE NOT NULL,
    `pag` DOUBLE NOT NULL,
    `emi` VARCHAR(191) NOT NULL,
    `dat` VARCHAR(191) NOT NULL,
    `rea` VARCHAR(191) NULL,
    `ini` VARCHAR(191) NOT NULL,
    `fim` VARCHAR(191) NOT NULL,
    `mestot` INTEGER NOT NULL,
    `met` VARCHAR(191) NOT NULL,
    `sta` VARCHAR(191) NOT NULL,
    `ref` VARCHAR(191) NULL,
    `creat_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,
    `cliente_id` VARCHAR(191) NOT NULL,
    `plano_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rub_pag` ADD CONSTRAINT `rub_pag_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `rub_emp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rub_pag` ADD CONSTRAINT `rub_pag_plano_id_fkey` FOREIGN KEY (`plano_id`) REFERENCES `rub_pla`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
