/*
  Warnings:

  - You are about to drop the `Host` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HostGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Host" DROP CONSTRAINT "Host_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Host" DROP CONSTRAINT "Host_providerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Host" DROP CONSTRAINT "Host_typeId_fkey";

-- DropTable
DROP TABLE "public"."Host";

-- DropTable
DROP TABLE "public"."HostGroup";

-- DropEnum
DROP TYPE "public"."HostStatus";

-- CreateTable
CREATE TABLE "public"."Program" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "version" VARCHAR(50),
    "vendor" VARCHAR(120),
    "category" VARCHAR(50) NOT NULL,
    "content" TEXT,
    "iconUrl" TEXT,
    "fileUrl" TEXT,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" VARCHAR(120),

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "public"."Program"("slug");

-- CreateIndex
CREATE INDEX "Program_category_idx" ON "public"."Program"("category");

-- CreateIndex
CREATE INDEX "Program_vendor_idx" ON "public"."Program"("vendor");

-- CreateIndex
CREATE INDEX "Program_updatedAt_idx" ON "public"."Program"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Program_name_version_key" ON "public"."Program"("name", "version");
