/*
  Warnings:

  - You are about to drop the column `passwordReset` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[organizationId,userId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.
  - Made the column `activeStatus` on table `Domain` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Announcement" ADD COLUMN     "type" "public"."AnnouncementType" NOT NULL DEFAULT 'ANNOUNCE',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Domain" ALTER COLUMN "activeStatus" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Membership" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "passwordReset",
DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'STAFF';

-- DropEnum
DROP TYPE "public"."OrgRole";

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "public"."Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_organizationId_idx" ON "public"."Membership"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_organizationId_userId_key" ON "public"."Membership"("organizationId", "userId");
