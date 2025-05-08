-- AlterTable
ALTER TABLE "product" ADD COLUMN     "id_setting_company" INTEGER DEFAULT 1;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_id_setting_company_fkey" FOREIGN KEY ("id_setting_company") REFERENCES "setting_company"("id_setting_company") ON DELETE SET NULL ON UPDATE CASCADE;
