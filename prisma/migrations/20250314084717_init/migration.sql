-- CreateTable
CREATE TABLE "tagihan_kso" (
    "id_tagihan_kso" SERIAL NOT NULL,
    "no_tagihan_kso" TEXT NOT NULL,
    "periode" TIMESTAMP(3) NOT NULL,
    "id_setting_company" INTEGER NOT NULL,
    "jumlah_pelanggan" INTEGER NOT NULL,
    "jumlah_pemasukan" DOUBLE PRECISION NOT NULL,
    "total_bhp_uso" DOUBLE PRECISION NOT NULL,
    "total_pph_final" DOUBLE PRECISION NOT NULL,
    "total_kso" DOUBLE PRECISION NOT NULL,
    "total_tagihan" DOUBLE PRECISION NOT NULL,
    "status_bayar" TEXT NOT NULL DEFAULT 'PENDING',
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,

    CONSTRAINT "tagihan_kso_pkey" PRIMARY KEY ("id_tagihan_kso")
);

-- AddForeignKey
ALTER TABLE "tagihan_kso" ADD CONSTRAINT "tagihan_kso_id_setting_company_fkey" FOREIGN KEY ("id_setting_company") REFERENCES "setting_company"("id_setting_company") ON DELETE RESTRICT ON UPDATE CASCADE;
