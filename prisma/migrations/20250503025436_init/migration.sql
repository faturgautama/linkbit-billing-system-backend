-- CreateTable
CREATE TABLE "payment_method_manual" (
    "id_payment_method_manual" SERIAL NOT NULL,
    "id_setting_company" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "no_rekening" TEXT,
    "create_at" TIMESTAMP(3) NOT NULL,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "payment_method_manual_pkey" PRIMARY KEY ("id_payment_method_manual")
);

-- AddForeignKey
ALTER TABLE "payment_method_manual" ADD CONSTRAINT "payment_method_manual_id_setting_company_fkey" FOREIGN KEY ("id_setting_company") REFERENCES "setting_company"("id_setting_company") ON DELETE RESTRICT ON UPDATE CASCADE;
