-- CreateTable
CREATE TABLE "setting_company" (
    "id_setting_company" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_email" TEXT NOT NULL,
    "company_short_name" TEXT NOT NULL,
    "company_address" TEXT NOT NULL,
    "company_phone" TEXT NOT NULL,
    "company_whatsapp" TEXT NOT NULL,
    "compny_email_admin" TEXT NOT NULL,
    "company_nomor_rekening" TEXT NOT NULL,
    "company_bank_name" TEXT NOT NULL,
    "tagihan_ppn" INTEGER NOT NULL,
    "tagihan_jatuh_tempo" INTEGER NOT NULL,
    "tagihan_use_unik_kode" BOOLEAN NOT NULL,
    "tagihan_biaya_admin" BIGINT NOT NULL,
    "tagihan_pesan_invoice" TEXT NOT NULL,
    "tagihan_pesan_lunas" TEXT NOT NULL,
    "tagihan_editor_invoice" TEXT NOT NULL,
    "tagihan_editor_pos" TEXT NOT NULL,
    "update_at" TIMESTAMP(3) NOT NULL,
    "update_by" INTEGER NOT NULL,

    CONSTRAINT "setting_company_pkey" PRIMARY KEY ("id_setting_company")
);

-- CreateTable
CREATE TABLE "product" (
    "id_product" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "invoice_cycle" TEXT NOT NULL,
    "days_before_send_invoice" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id_product")
);

-- CreateTable
CREATE TABLE "group_pelanggan" (
    "id_group_pelanggan" SERIAL NOT NULL,
    "group_pelanggan" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,

    CONSTRAINT "group_pelanggan_pkey" PRIMARY KEY ("id_group_pelanggan")
);

-- CreateTable
CREATE TABLE "pelanggan" (
    "id_pelanggan" SERIAL NOT NULL,
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
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,

    CONSTRAINT "pelanggan_pkey" PRIMARY KEY ("id_pelanggan")
);

-- CreateTable
CREATE TABLE "pelanggan_product" (
    "id_pelanggan_product" SERIAL NOT NULL,
    "id_pelanggan" INTEGER NOT NULL,
    "id_product" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "invoice_cycle" TEXT NOT NULL,
    "expired_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,

    CONSTRAINT "pelanggan_product_pkey" PRIMARY KEY ("id_pelanggan_product")
);

-- AddForeignKey
ALTER TABLE "pelanggan" ADD CONSTRAINT "pelanggan_id_setting_company_fkey" FOREIGN KEY ("id_setting_company") REFERENCES "setting_company"("id_setting_company") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelanggan" ADD CONSTRAINT "pelanggan_id_group_pelanggan_fkey" FOREIGN KEY ("id_group_pelanggan") REFERENCES "group_pelanggan"("id_group_pelanggan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelanggan_product" ADD CONSTRAINT "pelanggan_product_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggan"("id_pelanggan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelanggan_product" ADD CONSTRAINT "pelanggan_product_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "product"("id_product") ON DELETE RESTRICT ON UPDATE CASCADE;
