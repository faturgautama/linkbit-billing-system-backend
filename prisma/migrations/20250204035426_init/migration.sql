/*
  Warnings:

  - Added the required column `id_user_group` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "id_user_group" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "menu" (
    "id_menu" SERIAL NOT NULL,
    "menu" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "id_parent" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "create_by" INTEGER NOT NULL,
    "update_at" TIMESTAMP(3),
    "update_by" INTEGER,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id_menu")
);

-- CreateTable
CREATE TABLE "user_group_menu" (
    "id_user_group_menu" SERIAL NOT NULL,
    "id_user_group" INTEGER NOT NULL,
    "id_menu" INTEGER NOT NULL,

    CONSTRAINT "user_group_menu_pkey" PRIMARY KEY ("id_user_group_menu")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_id_user_group_fkey" FOREIGN KEY ("id_user_group") REFERENCES "user_group"("id_user_group") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_menu" ADD CONSTRAINT "user_group_menu_id_user_group_fkey" FOREIGN KEY ("id_user_group") REFERENCES "user_group"("id_user_group") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_menu" ADD CONSTRAINT "user_group_menu_id_menu_fkey" FOREIGN KEY ("id_menu") REFERENCES "menu"("id_menu") ON DELETE RESTRICT ON UPDATE CASCADE;
