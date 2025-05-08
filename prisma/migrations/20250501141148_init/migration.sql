/*
  Warnings:

  - You are about to drop the column `id_transaksi` on the `log_whatsapp_message` table. All the data in the column will be lost.
  - Added the required column `id_invoice` to the `log_whatsapp_message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "log_whatsapp_message" DROP COLUMN "id_transaksi",
ADD COLUMN     "id_invoice" INTEGER NOT NULL,
ADD COLUMN     "resent_at" TIMESTAMP(3),
ADD COLUMN     "resent_by" INTEGER;

-- CreateTable
CREATE TABLE "log_activity_user" (
    "id_log_activity_user" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "request_body" JSONB,
    "ip_address" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_activity_user_pkey" PRIMARY KEY ("id_log_activity_user")
);

-- AddForeignKey
ALTER TABLE "log_whatsapp_message" ADD CONSTRAINT "log_whatsapp_message_id_invoice_fkey" FOREIGN KEY ("id_invoice") REFERENCES "invoice"("id_invoice") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_activity_user" ADD CONSTRAINT "log_activity_user_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
