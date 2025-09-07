-- CreateEnum
CREATE TYPE "public"."PluginProcessStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Plugin" ADD COLUMN     "error" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."PluginProcessStatus" NOT NULL DEFAULT 'QUEUED';
