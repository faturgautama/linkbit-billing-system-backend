-- CreateTable
CREATE TABLE "channel_whatsapp" (
    "id_channel_whatsapp" SERIAL NOT NULL,
    "channel_whatsapp" TEXT NOT NULL,
    "api_url" TEXT NOT NULL,
    "required_credential" JSONB,
    "create_at" TIMESTAMP(3) NOT NULL,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "channel_whatsapp_pkey" PRIMARY KEY ("id_channel_whatsapp")
);

-- CreateTable
CREATE TABLE "setting_channel_whatsapp" (
    "id_setting_channel_whatsapp" SERIAL NOT NULL,
    "id_channel_whatsapp" INTEGER NOT NULL,
    "id_setting_company" INTEGER NOT NULL,
    "credential" JSONB,
    "create_at" TIMESTAMP(3) NOT NULL,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "setting_channel_whatsapp_pkey" PRIMARY KEY ("id_setting_channel_whatsapp")
);

-- AddForeignKey
ALTER TABLE "setting_channel_whatsapp" ADD CONSTRAINT "setting_channel_whatsapp_id_channel_whatsapp_fkey" FOREIGN KEY ("id_channel_whatsapp") REFERENCES "channel_whatsapp"("id_channel_whatsapp") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setting_channel_whatsapp" ADD CONSTRAINT "setting_channel_whatsapp_id_setting_company_fkey" FOREIGN KEY ("id_setting_company") REFERENCES "setting_company"("id_setting_company") ON DELETE RESTRICT ON UPDATE CASCADE;
