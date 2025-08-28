/*
  Warnings:

  - Made the column `statusCode` on table `Domain` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Domain" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "registeredAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "statusCode" SET NOT NULL,
ALTER COLUMN "statusCode" SET DEFAULT 200;

-- AlterTable
ALTER TABLE "public"."Program" ALTER COLUMN "category" SET DEFAULT 'Misc.';

-- CreateIndex
CREATE INDEX "Domain_name_idx" ON "public"."Domain"("name");

-- CreateIndex
CREATE INDEX "Domain_status_idx" ON "public"."Domain"("status");

-- CreateIndex
CREATE INDEX "Domain_registeredAt_idx" ON "public"."Domain"("registeredAt");

-- CreateIndex
CREATE INDEX "Domain_expiresAt_idx" ON "public"."Domain"("expiresAt");

-- CreateIndex
CREATE INDEX "Domain_hostId_idx" ON "public"."Domain"("hostId");

-- CreateIndex
CREATE INDEX "Domain_hostTypeId_idx" ON "public"."Domain"("hostTypeId");

-- CreateIndex
CREATE INDEX "Domain_domainMailId_idx" ON "public"."Domain"("domainMailId");

-- CreateIndex
CREATE INDEX "Domain_hostMailId_idx" ON "public"."Domain"("hostMailId");

-- CreateIndex
CREATE INDEX "Domain_cloudflareMailId_idx" ON "public"."Domain"("cloudflareMailId");

-- CreateIndex
CREATE INDEX "Domain_teamId_idx" ON "public"."Domain"("teamId");
