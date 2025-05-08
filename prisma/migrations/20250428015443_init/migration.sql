-- CreateTable
CREATE TABLE "template_editor" (
    "id_template_editor" SERIAL NOT NULL,
    "template_pesan_invoice" TEXT NOT NULL,
    "template_pesan_lunas" TEXT NOT NULL,
    "template_editor_invoice" TEXT NOT NULL,
    "template_editor_pos" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,

    CONSTRAINT "template_editor_pkey" PRIMARY KEY ("id_template_editor")
);
