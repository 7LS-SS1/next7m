-- CreateTable
CREATE TABLE "public"."Wordpress" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "url" VARCHAR(512),
    "user" VARCHAR(128),
    "passwordHash" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wordpress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wordpress_domainId_key" ON "public"."Wordpress"("domainId");

-- CreateIndex
CREATE INDEX "Wordpress_createdAt_idx" ON "public"."Wordpress"("createdAt");

-- CreateIndex
CREATE INDEX "Wordpress_url_idx" ON "public"."Wordpress"("url");

-- AddForeignKey
ALTER TABLE "public"."Wordpress" ADD CONSTRAINT "Wordpress_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "public"."Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
