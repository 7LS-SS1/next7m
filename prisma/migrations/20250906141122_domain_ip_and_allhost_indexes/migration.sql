/*
  Warnings:

  - A unique constraint covering the columns `[hostProviderId,ip]` on the table `AllHost` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Domain" ADD COLUMN     "ip" TEXT;

-- CreateIndex
CREATE INDEX "AllHost_hostProviderId_idx" ON "public"."AllHost"("hostProviderId");

-- CreateIndex
CREATE INDEX "AllHost_emailId_idx" ON "public"."AllHost"("emailId");

-- CreateIndex
CREATE INDEX "AllHost_createdOn_idx" ON "public"."AllHost"("createdOn");

-- CreateIndex
CREATE UNIQUE INDEX "AllHost_hostProviderId_ip_key" ON "public"."AllHost"("hostProviderId", "ip");

-- CreateIndex
CREATE INDEX "Domain_ip_idx" ON "public"."Domain"("ip");
