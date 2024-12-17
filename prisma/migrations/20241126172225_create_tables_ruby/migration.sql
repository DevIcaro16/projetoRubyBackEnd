/*
  Warnings:

  - You are about to drop the column `cliente_id` on the `rub_pag` table. All the data in the column will be lost.
  - You are about to drop the column `plano_id` on the `rub_pag` table. All the data in the column will be lost.
  - You are about to drop the `clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `planos` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `rea` on table `rub_pag` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ref` on table `rub_pag` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `clientes` DROP FOREIGN KEY `clientes_plano_id_fkey`;

-- DropForeignKey
ALTER TABLE `rub_pag` DROP FOREIGN KEY `rub_pag_cliente_id_fkey`;

-- DropForeignKey
ALTER TABLE `rub_pag` DROP FOREIGN KEY `rub_pag_plano_id_fkey`;

-- AlterTable
ALTER TABLE `rub_pag` DROP COLUMN `cliente_id`,
    DROP COLUMN `plano_id`,
    MODIFY `rea` VARCHAR(191) NOT NULL,
    MODIFY `ref` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `clientes`;

-- DropTable
DROP TABLE `planos`;
