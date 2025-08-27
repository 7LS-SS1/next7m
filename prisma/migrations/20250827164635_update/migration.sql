/*
  Warnings:

  - You are about to drop the column `team` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Team" DROP COLUMN "team",
ADD COLUMN     "note" TEXT;
