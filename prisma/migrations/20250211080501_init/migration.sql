/*
  Warnings:

  - You are about to drop the column `expired_date` on the `invoice` table. All the data in the column will be lost.
  - Added the required column `due_date` to the `invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "expired_date",
ADD COLUMN     "due_date" TIMESTAMP(3) NOT NULL;
