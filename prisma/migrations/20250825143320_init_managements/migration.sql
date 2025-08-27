-- AlterTable
ALTER TABLE "public"."Project" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "note" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Team" ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "note" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "public"."EmailAccount" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailAccount_address_key" ON "public"."EmailAccount"("address");
