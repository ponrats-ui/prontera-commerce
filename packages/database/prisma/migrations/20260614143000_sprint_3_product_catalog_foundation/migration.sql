-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductVariantStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "categories"
ADD COLUMN "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "category_translations"
ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products"
ADD COLUMN "sku" VARCHAR(120);

UPDATE "products"
SET "sku" = "slug"
WHERE "sku" IS NULL;

ALTER TABLE "products"
ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_categoryId_fkey";
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "product_translations"
ADD COLUMN "shortDescription" VARCHAR(500),
ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "product_variants"
ADD COLUMN "compareAtPriceCents" INTEGER,
ADD COLUMN "status" "ProductVariantStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "categories_shopId_status_idx" ON "categories"("shopId", "status");
CREATE INDEX "products_shopId_sku_idx" ON "products"("shopId", "sku");
CREATE INDEX "products_shopId_slug_idx" ON "products"("shopId", "slug");
CREATE INDEX "product_variants_productId_sku_idx" ON "product_variants"("productId", "sku");
CREATE INDEX "product_variants_productId_status_idx" ON "product_variants"("productId", "status");

-- Soft-delete-aware uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "categories_shopId_slug_active_key" ON "categories"("shopId", "slug") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "products_shopId_slug_active_key" ON "products"("shopId", "slug") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "products_shopId_sku_active_key" ON "products"("shopId", "sku") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_productId_sku_active_key" ON "product_variants"("productId", "sku") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "category_translations_categoryId_localeCode_active_key" ON "category_translations"("categoryId", "localeCode") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "product_translations_productId_localeCode_active_key" ON "product_translations"("productId", "localeCode") WHERE "deletedAt" IS NULL;
