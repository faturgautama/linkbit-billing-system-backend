/*
  Warnings:

  - You are about to drop the column `compny_email_admin` on the `setting_company` table. All the data in the column will be lost.
  - Added the required column `id_setting_company` to the `group_pelanggan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `days_before_send_invoice` to the `pelanggan_product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `pelanggan_product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_email_admin` to the `setting_company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `create_at` to the `setting_company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `create_by` to the `setting_company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_setting_company` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "group_pelanggan" ADD COLUMN     "id_setting_company" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pelanggan_product" ADD COLUMN     "days_before_send_invoice" INTEGER NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "setting_company" DROP COLUMN "compny_email_admin",
ADD COLUMN     "api_key_pg" TEXT,
ADD COLUMN     "company_email_admin" TEXT NOT NULL,
ADD COLUMN     "create_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "create_by" INTEGER NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_cabang" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_mitra" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "update_at" DROP NOT NULL,
ALTER COLUMN "update_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "id_setting_company" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "log_whatsapp_message" (
    "id_log_whatsapp_message" SERIAL NOT NULL,
    "id_transaksi" INTEGER NOT NULL,
    "id_setting_company" INTEGER NOT NULL,
    "additional_info" JSONB,
    "sent_at" TIMESTAMP(3) NOT NULL,
    "sent_by" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',

    CONSTRAINT "log_whatsapp_message_pkey" PRIMARY KEY ("id_log_whatsapp_message")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_id_setting_company_fkey" FOREIGN KEY ("id_setting_company") REFERENCES "setting_company"("id_setting_company") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_whatsapp_message" ADD CONSTRAINT "log_whatsapp_message_id_setting_company_fkey" FOREIGN KEY ("id_setting_company") REFERENCES "setting_company"("id_setting_company") ON DELETE RESTRICT ON UPDATE CASCADE;
