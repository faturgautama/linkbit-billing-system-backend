-- AlterTable
ALTER TABLE "pelanggan" ADD COLUMN     "delete_at" TIMESTAMP(3),
ADD COLUMN     "delete_by" INTEGER,
ADD COLUMN     "is_delete" BOOLEAN DEFAULT false;
