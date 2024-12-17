/*
  Warnings:

  - Added the required column `sta` to the `rub_emp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `rub_emp` ADD COLUMN `sta` VARCHAR(191) NOT NULL;
