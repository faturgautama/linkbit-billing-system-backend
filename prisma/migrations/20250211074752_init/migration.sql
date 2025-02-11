-- CreateTable
CREATE TABLE "invoice" (
    "id_invoice" SERIAL NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "id_pelanggan" INTEGER NOT NULL,
    "id_pelanggan_product" INTEGER NOT NULL,
    "id_product" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "diskon_percentage" DOUBLE PRECISION NOT NULL,
    "diskon_rupiah" DOUBLE PRECISION NOT NULL,
    "pajak" INTEGER NOT NULL,
    "admin_fee" DOUBLE PRECISION NOT NULL,
    "unique_code" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "expired_date" TIMESTAMP(3),
    "notes" TEXT,
    "invoice_status" TEXT NOT NULL DEFAULT 'PENDING',
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "delete_at" TIMESTAMP(3),
    "delete_by" INTEGER,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id_invoice")
);

-- CreateTable
CREATE TABLE "payment" (
    "id_payment" SERIAL NOT NULL,
    "id_invoice" INTEGER NOT NULL,
    "id_pelanggan" INTEGER NOT NULL,
    "id_product" INTEGER NOT NULL,
    "payment_id" TEXT NOT NULL,
    "payment_number" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "payment_amount" DOUBLE PRECISION NOT NULL,
    "payment_provider" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id_payment")
);

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggan"("id_pelanggan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_id_pelanggan_product_fkey" FOREIGN KEY ("id_pelanggan_product") REFERENCES "pelanggan_product"("id_pelanggan_product") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "product"("id_product") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_id_invoice_fkey" FOREIGN KEY ("id_invoice") REFERENCES "invoice"("id_invoice") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggan"("id_pelanggan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "product"("id_product") ON DELETE RESTRICT ON UPDATE CASCADE;
