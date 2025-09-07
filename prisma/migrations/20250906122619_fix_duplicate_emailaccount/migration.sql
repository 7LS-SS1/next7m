-- CreateTable
CREATE TABLE "public"."AllHost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "created_on" TIMESTAMP(3),
    "hostProviderId" TEXT,
    "emailId" TEXT,

    CONSTRAINT "AllHost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AllHost_hostProviderId_idx" ON "public"."AllHost"("hostProviderId");

-- CreateIndex
CREATE INDEX "AllHost_emailId_idx" ON "public"."AllHost"("emailId");

-- CreateIndex
CREATE INDEX "AllHost_created_on_idx" ON "public"."AllHost"("created_on");

-- AddForeignKey
ALTER TABLE "public"."AllHost" ADD CONSTRAINT "AllHost_hostProviderId_fkey" FOREIGN KEY ("hostProviderId") REFERENCES "public"."HostProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AllHost" ADD CONSTRAINT "AllHost_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."EmailAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
