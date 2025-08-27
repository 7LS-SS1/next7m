/*
  Warnings:

  - You are about to drop the column `note` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Team" DROP COLUMN "note",
ADD COLUMN     "team" TEXT;
