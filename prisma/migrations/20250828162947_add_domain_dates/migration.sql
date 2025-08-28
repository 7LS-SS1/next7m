-- AlterTable
ALTER TABLE "public"."Domain" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 year';
