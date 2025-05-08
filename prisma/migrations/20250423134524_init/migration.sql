-- CreateTable
CREATE TABLE "history_import_pelanggan" (
    "id_history" SERIAL NOT NULL,
    "id_pelanggan" INTEGER NOT NULL,
    "id_setting_company" INTEGER NOT NULL,
    "id_group_pelanggan" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "pelanggan_code" TEXT NOT NULL,
    "identity_number" TEXT,
    "email" TEXT,
    "password" TEXT,
    "alamat" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "subscribe_start_date" TIMESTAMP(3),
    "pic_name" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,

    CONSTRAINT "history_import_pelanggan_pkey" PRIMARY KEY ("id_history")
);

-- AddForeignKey
ALTER TABLE "history_import_pelanggan" ADD CONSTRAINT "history_import_pelanggan_id_setting_company_fkey" FOREIGN KEY ("id_setting_company") REFERENCES "setting_company"("id_setting_company") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_import_pelanggan" ADD CONSTRAINT "history_import_pelanggan_id_group_pelanggan_fkey" FOREIGN KEY ("id_group_pelanggan") REFERENCES "group_pelanggan"("id_group_pelanggan") ON DELETE RESTRICT ON UPDATE CASCADE;
