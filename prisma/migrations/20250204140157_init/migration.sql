/*
  Warnings:

  - Added the required column `product_name` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product" ADD COLUMN     "product_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "setting_company" ALTER COLUMN "tagihan_biaya_admin" SET DATA TYPE DOUBLE PRECISION;
