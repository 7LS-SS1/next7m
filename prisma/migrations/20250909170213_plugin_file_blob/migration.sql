-- AlterTable
ALTER TABLE "public"."Plugin" ADD COLUMN     "fileBlob" BYTEA,
ADD COLUMN     "fileHash" VARCHAR(128),
ADD COLUMN     "fileKey" VARCHAR(200),
ADD COLUMN     "fileMime" VARCHAR(120),
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "storage" VARCHAR(50) DEFAULT 'local';
