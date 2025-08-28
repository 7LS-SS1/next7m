-- AlterTable
ALTER TABLE "public"."Domain" ADD COLUMN     "activeStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cloudflareMailId" TEXT,
ADD COLUMN     "domainMailId" TEXT,
ADD COLUMN     "hostId" TEXT,
ADD COLUMN     "hostMailId" TEXT,
ADD COLUMN     "hostTypeId" TEXT,
ADD COLUMN     "redirect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statusCode" INTEGER,
ADD COLUMN     "teamId" TEXT,
ADD COLUMN     "wordpressInstall" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "registeredAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."HostProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_hostTypeId_fkey" FOREIGN KEY ("hostTypeId") REFERENCES "public"."HostType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_domainMailId_fkey" FOREIGN KEY ("domainMailId") REFERENCES "public"."EmailAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_hostMailId_fkey" FOREIGN KEY ("hostMailId") REFERENCES "public"."EmailAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_cloudflareMailId_fkey" FOREIGN KEY ("cloudflareMailId") REFERENCES "public"."EmailAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
