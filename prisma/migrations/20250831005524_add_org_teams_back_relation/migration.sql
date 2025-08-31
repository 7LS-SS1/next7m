-- AlterTable
ALTER TABLE "public"."Team" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "Team_organizationId_idx" ON "public"."Team"("organizationId");

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
