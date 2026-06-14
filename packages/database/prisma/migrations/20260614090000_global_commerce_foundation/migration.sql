-- CreateTable
CREATE TABLE "locales" (
    "code" VARCHAR(35) NOT NULL,
    "languageCode" VARCHAR(12) NOT NULL,
    "regionCode" CHAR(2),
    "name" VARCHAR(120) NOT NULL,
    "nativeName" VARCHAR(120),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "locales_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "currencies" (
    "code" CHAR(3) NOT NULL,
    "numericCode" CHAR(3),
    "name" VARCHAR(120) NOT NULL,
    "symbol" VARCHAR(16),
    "decimalDigits" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("code")
);

-- SeedReferenceData
INSERT INTO "locales" ("code", "languageCode", "regionCode", "name", "nativeName", "isDefault", "updatedAt")
VALUES ('en-US', 'en', 'US', 'English (United States)', 'English (United States)', true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "currencies" ("code", "numericCode", "name", "symbol", "decimalDigits", "isActive", "updatedAt")
VALUES ('USD', '840', 'United States Dollar', '$', 2, true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "currencies" ("code", "name", "decimalDigits", "isActive", "updatedAt")
SELECT DISTINCT "currency", "currency", 2, true, CURRENT_TIMESTAMP
FROM (
    SELECT "currency" FROM "plans"
    UNION
    SELECT "currency" FROM "invoices"
    UNION
    SELECT "currency" FROM "product_variants"
) AS "used_currencies"
WHERE "currency" IS NOT NULL
ON CONFLICT ("code") DO NOTHING;

-- CreateTable
CREATE TABLE "countries" (
    "code" CHAR(2) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "defaultCurrencyCode" CHAR(3) NOT NULL,
    "defaultLocaleCode" VARCHAR(35),
    "defaultTimeZone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "countries_pkey" PRIMARY KEY ("code")
);

INSERT INTO "countries" ("code", "name", "defaultCurrencyCode", "defaultLocaleCode", "defaultTimeZone", "isActive", "updatedAt")
VALUES ('US', 'United States', 'USD', 'en-US', 'America/New_York', true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "countryCode" CHAR(2),
ADD COLUMN "localeCode" VARCHAR(35),
ADD COLUMN "timeZone" VARCHAR(64) NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "shops"
ADD COLUMN "countryCode" CHAR(2) NOT NULL DEFAULT 'US',
ADD COLUMN "localeCode" VARCHAR(35) NOT NULL DEFAULT 'en-US',
ADD COLUMN "currencyCode" CHAR(3) NOT NULL DEFAULT 'USD',
ADD COLUMN "timeZone" VARCHAR(64) NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "shop_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "shop_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "categoryId" UUID NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_prices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productVariantId" UUID NOT NULL,
    "currencyCode" CHAR(3) NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "compareAtPriceCents" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "product_variant_prices_pkey" PRIMARY KEY ("id")
);

-- BackfillVariantPrices
INSERT INTO "product_variant_prices" ("productVariantId", "currencyCode", "priceCents", "createdAt", "updatedAt")
SELECT "id", "currency", "priceCents", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "product_variants"
WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE INDEX "locales_languageCode_idx" ON "locales"("languageCode");
CREATE INDEX "locales_regionCode_idx" ON "locales"("regionCode");
CREATE INDEX "locales_deletedAt_idx" ON "locales"("deletedAt");
CREATE INDEX "currencies_isActive_idx" ON "currencies"("isActive");
CREATE INDEX "currencies_deletedAt_idx" ON "currencies"("deletedAt");
CREATE INDEX "countries_defaultCurrencyCode_idx" ON "countries"("defaultCurrencyCode");
CREATE INDEX "countries_defaultLocaleCode_idx" ON "countries"("defaultLocaleCode");
CREATE INDEX "countries_isActive_idx" ON "countries"("isActive");
CREATE INDEX "countries_deletedAt_idx" ON "countries"("deletedAt");
CREATE INDEX "users_countryCode_idx" ON "users"("countryCode");
CREATE INDEX "users_localeCode_idx" ON "users"("localeCode");
CREATE INDEX "plans_currency_idx" ON "plans"("currency");
CREATE INDEX "invoices_currency_idx" ON "invoices"("currency");
CREATE INDEX "shops_countryCode_idx" ON "shops"("countryCode");
CREATE INDEX "shops_localeCode_idx" ON "shops"("localeCode");
CREATE INDEX "shops_currencyCode_idx" ON "shops"("currencyCode");
CREATE INDEX "shop_translations_localeCode_idx" ON "shop_translations"("localeCode");
CREATE INDEX "shop_translations_deletedAt_idx" ON "shop_translations"("deletedAt");
CREATE INDEX "category_translations_localeCode_idx" ON "category_translations"("localeCode");
CREATE INDEX "category_translations_deletedAt_idx" ON "category_translations"("deletedAt");
CREATE INDEX "product_translations_localeCode_idx" ON "product_translations"("localeCode");
CREATE INDEX "product_translations_deletedAt_idx" ON "product_translations"("deletedAt");
CREATE INDEX "product_variants_currency_idx" ON "product_variants"("currency");
CREATE INDEX "product_variant_prices_currencyCode_idx" ON "product_variant_prices"("currencyCode");
CREATE INDEX "product_variant_prices_deletedAt_idx" ON "product_variant_prices"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "shop_translations_shopId_localeCode_active_key" ON "shop_translations"("shopId", "localeCode") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "category_translations_categoryId_localeCode_active_key" ON "category_translations"("categoryId", "localeCode") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "category_translations_categoryId_localeCode_slug_active_key" ON "category_translations"("categoryId", "localeCode", "slug") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "product_translations_productId_localeCode_active_key" ON "product_translations"("productId", "localeCode") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "product_translations_productId_localeCode_slug_active_key" ON "product_translations"("productId", "localeCode", "slug") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "product_variant_prices_variantId_currencyCode_active_key" ON "product_variant_prices"("productVariantId", "currencyCode") WHERE "deletedAt" IS NULL;

-- AddCheckConstraint
ALTER TABLE "currencies" ADD CONSTRAINT "currencies_decimalDigits_nonnegative_chk" CHECK ("decimalDigits" >= 0);
ALTER TABLE "product_variant_prices" ADD CONSTRAINT "product_variant_prices_amounts_nonnegative_chk" CHECK ("priceCents" >= 0 AND ("compareAtPriceCents" IS NULL OR "compareAtPriceCents" >= 0));

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_defaultCurrencyCode_fkey" FOREIGN KEY ("defaultCurrencyCode") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "countries" ADD CONSTRAINT "countries_defaultLocaleCode_fkey" FOREIGN KEY ("defaultLocaleCode") REFERENCES "locales"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "locales"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "plans" ADD CONSTRAINT "plans_currency_fkey" FOREIGN KEY ("currency") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_currency_fkey" FOREIGN KEY ("currency") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shops" ADD CONSTRAINT "shops_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shops" ADD CONSTRAINT "shops_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shops" ADD CONSTRAINT "shops_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shop_translations" ADD CONSTRAINT "shop_translations_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_translations" ADD CONSTRAINT "shop_translations_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_currency_fkey" FOREIGN KEY ("currency") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_variant_prices" ADD CONSTRAINT "product_variant_prices_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_variant_prices" ADD CONSTRAINT "product_variant_prices_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
