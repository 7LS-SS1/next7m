/*
  Warnings:

  - You are about to drop the column `statusCode` on the `Domain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Domain" DROP COLUMN "statusCode",
ADD COLUMN     "price" DOUBLE PRECISION;
