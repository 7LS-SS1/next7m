/*
  Warnings:

  - You are about to drop the column `created_on` on the `AllHost` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."AllHost_created_on_idx";

-- AlterTable
ALTER TABLE "public"."AllHost" DROP COLUMN "created_on",
ADD COLUMN     "createdOn" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "AllHost_createdOn_idx" ON "public"."AllHost"("createdOn");
