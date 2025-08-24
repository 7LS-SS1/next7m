-- AlterTable
ALTER TABLE "public"."Host" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "typeId" TEXT;

-- CreateTable
CREATE TABLE "public"."HostProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HostGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HostType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HostProvider_name_key" ON "public"."HostProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HostGroup_name_key" ON "public"."HostGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HostType_name_key" ON "public"."HostType"("name");

-- CreateIndex
CREATE INDEX "Host_providerId_idx" ON "public"."Host"("providerId");

-- CreateIndex
CREATE INDEX "Host_groupId_idx" ON "public"."Host"("groupId");

-- CreateIndex
CREATE INDEX "Host_typeId_idx" ON "public"."Host"("typeId");

-- AddForeignKey
ALTER TABLE "public"."Host" ADD CONSTRAINT "Host_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."HostProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Host" ADD CONSTRAINT "Host_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."HostGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Host" ADD CONSTRAINT "Host_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."HostType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
