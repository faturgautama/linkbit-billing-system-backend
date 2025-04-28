/*
  Warnings:

  - Made the column `id_setting_company` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_id_setting_company_fkey";

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "id_setting_company" SET NOT NULL,
ALTER COLUMN "id_setting_company" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_id_setting_company_fkey" FOREIGN KEY ("id_setting_company") REFERENCES "setting_company"("id_setting_company") ON DELETE RESTRICT ON UPDATE CASCADE;
