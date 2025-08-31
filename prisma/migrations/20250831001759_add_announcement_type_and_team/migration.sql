-- CreateEnum
CREATE TYPE "public"."AnnouncementType" AS ENUM ('ANNOUNCE', 'URGENT', 'GENERAL');

-- AlterTable
ALTER TABLE "public"."Announcement" ADD COLUMN     "teamId" TEXT,
ADD COLUMN     "type" "public"."AnnouncementType" NOT NULL DEFAULT 'ANNOUNCE';

-- CreateIndex
CREATE INDEX "Announcement_teamId_idx" ON "public"."Announcement"("teamId");

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
