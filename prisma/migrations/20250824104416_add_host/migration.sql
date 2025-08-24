-- CreateEnum
CREATE TYPE "public"."HostStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "public"."Host" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT,
    "note" TEXT,
    "status" "public"."HostStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Host_name_key" ON "public"."Host"("name");
