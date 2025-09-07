/*
  Warnings:

  - You are about to drop the column `publishedAt` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Membership` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Work` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Work" DROP CONSTRAINT "Work_organizationId_fkey";

-- DropIndex
DROP INDEX "public"."Announcement_teamId_idx";

-- DropIndex
DROP INDEX "public"."Membership_organizationId_idx";

-- DropIndex
DROP INDEX "public"."Membership_userId_organizationId_key";

-- DropIndex
DROP INDEX "public"."Work_assignedToId_idx";

-- DropIndex
DROP INDEX "public"."Work_organizationId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Announcement" DROP COLUMN "publishedAt",
DROP COLUMN "type",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Membership" DROP COLUMN "role",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "passwordReset" TEXT,
ADD COLUMN     "role" "public"."OrgRole";

-- AlterTable
ALTER TABLE "public"."Work" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Work" ADD CONSTRAINT "Work_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
