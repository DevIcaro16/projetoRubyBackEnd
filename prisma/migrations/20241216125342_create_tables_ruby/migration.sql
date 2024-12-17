/*
  Warnings:

  - Added the required column `mat` to the `rub_pag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `rub_pag` ADD COLUMN `mat` INTEGER NOT NULL;
