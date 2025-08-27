-- CreateTable
CREATE TABLE "public"."Plugin" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "version" VARCHAR(50),
    "vendor" VARCHAR(120),
    "pluginType" VARCHAR(50),
    "category" VARCHAR(50) NOT NULL,
    "content" TEXT,
    "iconUrl" TEXT,
    "fileUrl" TEXT,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "slug" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_slug_key" ON "public"."Plugin"("slug");

-- CreateIndex
CREATE INDEX "Plugin_category_idx" ON "public"."Plugin"("category");

-- CreateIndex
CREATE INDEX "Plugin_vendor_idx" ON "public"."Plugin"("vendor");

-- CreateIndex
CREATE INDEX "Plugin_updatedAt_idx" ON "public"."Plugin"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_name_version_key" ON "public"."Plugin"("name", "version");
