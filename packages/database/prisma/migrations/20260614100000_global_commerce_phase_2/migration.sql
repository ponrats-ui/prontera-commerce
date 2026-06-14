-- CreateEnum
CREATE TYPE "PaymentGatewayProvider" AS ENUM ('STRIPE', 'OMISE', 'XENDIT', 'PAYPAL', 'MANUAL', 'LOCAL_BANK_TRANSFER', 'PROMPTPAY', 'PAYNOW');

-- CreateEnum
CREATE TYPE "PaymentGatewayStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "ShippingZoneStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "TaxProfileStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "languages" (
    "code" VARCHAR(12) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "nativeName" VARCHAR(120),
    "direction" VARCHAR(3) NOT NULL DEFAULT 'ltr',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "languages_pkey" PRIMARY KEY ("code")
);

-- SeedLanguages
INSERT INTO "languages" ("code", "name", "nativeName", "direction", "isActive", "updatedAt")
VALUES
    ('en', 'English', 'English', 'ltr', true, CURRENT_TIMESTAMP),
    ('th', 'Thai', 'ไทย', 'ltr', true, CURRENT_TIMESTAMP),
    ('ja', 'Japanese', '日本語', 'ltr', true, CURRENT_TIMESTAMP),
    ('vi', 'Vietnamese', 'Tiếng Việt', 'ltr', true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
    "name" = EXCLUDED."name",
    "nativeName" = EXCLUDED."nativeName",
    "direction" = EXCLUDED."direction",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;

-- SeedCurrencies
INSERT INTO "currencies" ("code", "numericCode", "name", "symbol", "decimalDigits", "isActive", "updatedAt")
VALUES
    ('THB', '764', 'Thai Baht', '฿', 2, true, CURRENT_TIMESTAMP),
    ('USD', '840', 'United States Dollar', '$', 2, true, CURRENT_TIMESTAMP),
    ('JPY', '392', 'Japanese Yen', '¥', 0, true, CURRENT_TIMESTAMP),
    ('SGD', '702', 'Singapore Dollar', 'S$', 2, true, CURRENT_TIMESTAMP),
    ('VND', '704', 'Vietnamese Dong', '₫', 0, true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
    "numericCode" = EXCLUDED."numericCode",
    "name" = EXCLUDED."name",
    "symbol" = EXCLUDED."symbol",
    "decimalDigits" = EXCLUDED."decimalDigits",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;

-- SeedLocales
INSERT INTO "locales" ("code", "languageCode", "regionCode", "name", "nativeName", "isDefault", "updatedAt")
VALUES
    ('th-TH', 'th', 'TH', 'Thai (Thailand)', 'ไทย (ประเทศไทย)', false, CURRENT_TIMESTAMP),
    ('en-US', 'en', 'US', 'English (United States)', 'English (United States)', true, CURRENT_TIMESTAMP),
    ('ja-JP', 'ja', 'JP', 'Japanese (Japan)', '日本語 (日本)', false, CURRENT_TIMESTAMP),
    ('en-SG', 'en', 'SG', 'English (Singapore)', 'English (Singapore)', false, CURRENT_TIMESTAMP),
    ('vi-VN', 'vi', 'VN', 'Vietnamese (Vietnam)', 'Tiếng Việt (Việt Nam)', false, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
    "languageCode" = EXCLUDED."languageCode",
    "regionCode" = EXCLUDED."regionCode",
    "name" = EXCLUDED."name",
    "nativeName" = EXCLUDED."nativeName",
    "isDefault" = EXCLUDED."isDefault",
    "updatedAt" = CURRENT_TIMESTAMP;

-- SeedCountries
INSERT INTO "countries" ("code", "name", "defaultCurrencyCode", "defaultLocaleCode", "defaultTimeZone", "isActive", "updatedAt")
VALUES
    ('TH', 'Thailand', 'THB', 'th-TH', 'Asia/Bangkok', true, CURRENT_TIMESTAMP),
    ('US', 'United States', 'USD', 'en-US', 'America/New_York', true, CURRENT_TIMESTAMP),
    ('JP', 'Japan', 'JPY', 'ja-JP', 'Asia/Tokyo', true, CURRENT_TIMESTAMP),
    ('SG', 'Singapore', 'SGD', 'en-SG', 'Asia/Singapore', true, CURRENT_TIMESTAMP),
    ('VN', 'Vietnam', 'VND', 'vi-VN', 'Asia/Ho_Chi_Minh', true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
    "name" = EXCLUDED."name",
    "defaultCurrencyCode" = EXCLUDED."defaultCurrencyCode",
    "defaultLocaleCode" = EXCLUDED."defaultLocaleCode",
    "defaultTimeZone" = EXCLUDED."defaultTimeZone",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "currency_exchange_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "baseCurrencyCode" CHAR(3) NOT NULL,
    "quoteCurrencyCode" CHAR(3) NOT NULL,
    "rate" DECIMAL(20,10) NOT NULL,
    "provider" VARCHAR(80) NOT NULL,
    "effectiveAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "currency_exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "countryCode" CHAR(2) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "registrationNumber" VARCHAR(120),
    "rateBps" INTEGER NOT NULL DEFAULT 0,
    "pricesIncludeTax" BOOLEAN NOT NULL DEFAULT false,
    "appliesToShipping" BOOLEAN NOT NULL DEFAULT false,
    "status" "TaxProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "tax_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "status" "ShippingZoneStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zone_countries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shippingZoneId" UUID NOT NULL,
    "countryCode" CHAR(2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "shipping_zone_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateway_configurations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "provider" "PaymentGatewayProvider" NOT NULL,
    "status" "PaymentGatewayStatus" NOT NULL DEFAULT 'DRAFT',
    "displayName" VARCHAR(160) NOT NULL,
    "accountRef" VARCHAR(160),
    "supportedCurrencies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "supportedCountries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "credentialsRef" VARCHAR(240),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "payment_gateway_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "languages_isActive_idx" ON "languages"("isActive");
CREATE INDEX "languages_deletedAt_idx" ON "languages"("deletedAt");
CREATE INDEX "currency_exchange_rates_baseCurrencyCode_quoteCurrencyCode_effectiveAt_idx" ON "currency_exchange_rates"("baseCurrencyCode", "quoteCurrencyCode", "effectiveAt");
CREATE INDEX "currency_exchange_rates_provider_idx" ON "currency_exchange_rates"("provider");
CREATE INDEX "currency_exchange_rates_deletedAt_idx" ON "currency_exchange_rates"("deletedAt");
CREATE INDEX "tax_profiles_shopId_status_idx" ON "tax_profiles"("shopId", "status");
CREATE INDEX "tax_profiles_countryCode_idx" ON "tax_profiles"("countryCode");
CREATE INDEX "tax_profiles_deletedAt_idx" ON "tax_profiles"("deletedAt");
CREATE INDEX "shipping_zones_shopId_status_idx" ON "shipping_zones"("shopId", "status");
CREATE INDEX "shipping_zones_deletedAt_idx" ON "shipping_zones"("deletedAt");
CREATE INDEX "shipping_zone_countries_countryCode_idx" ON "shipping_zone_countries"("countryCode");
CREATE INDEX "shipping_zone_countries_deletedAt_idx" ON "shipping_zone_countries"("deletedAt");
CREATE INDEX "payment_gateway_configurations_shopId_provider_status_idx" ON "payment_gateway_configurations"("shopId", "provider", "status");
CREATE INDEX "payment_gateway_configurations_deletedAt_idx" ON "payment_gateway_configurations"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "currency_exchange_rates_pair_provider_effectiveAt_active_key" ON "currency_exchange_rates"("baseCurrencyCode", "quoteCurrencyCode", "provider", "effectiveAt") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "tax_profiles_shopId_countryCode_active_key" ON "tax_profiles"("shopId", "countryCode") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "shipping_zone_countries_zoneId_countryCode_active_key" ON "shipping_zone_countries"("shippingZoneId", "countryCode") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "payment_gateway_configurations_shopId_provider_active_key" ON "payment_gateway_configurations"("shopId", "provider") WHERE "deletedAt" IS NULL;

-- AddCheckConstraint
ALTER TABLE "currency_exchange_rates" ADD CONSTRAINT "currency_exchange_rates_positive_rate_chk" CHECK ("rate" > 0);
ALTER TABLE "currency_exchange_rates" ADD CONSTRAINT "currency_exchange_rates_distinct_pair_chk" CHECK ("baseCurrencyCode" <> "quoteCurrencyCode");
ALTER TABLE "currency_exchange_rates" ADD CONSTRAINT "currency_exchange_rates_expiry_order_chk" CHECK ("expiresAt" IS NULL OR "expiresAt" > "effectiveAt");
ALTER TABLE "tax_profiles" ADD CONSTRAINT "tax_profiles_rate_bps_range_chk" CHECK ("rateBps" >= 0 AND "rateBps" <= 10000);

-- AddForeignKey
ALTER TABLE "locales" ADD CONSTRAINT "locales_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "currency_exchange_rates" ADD CONSTRAINT "currency_exchange_rates_baseCurrencyCode_fkey" FOREIGN KEY ("baseCurrencyCode") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "currency_exchange_rates" ADD CONSTRAINT "currency_exchange_rates_quoteCurrencyCode_fkey" FOREIGN KEY ("quoteCurrencyCode") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tax_profiles" ADD CONSTRAINT "tax_profiles_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tax_profiles" ADD CONSTRAINT "tax_profiles_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shipping_zones" ADD CONSTRAINT "shipping_zones_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipping_zone_countries" ADD CONSTRAINT "shipping_zone_countries_shippingZoneId_fkey" FOREIGN KEY ("shippingZoneId") REFERENCES "shipping_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipping_zone_countries" ADD CONSTRAINT "shipping_zone_countries_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_gateway_configurations" ADD CONSTRAINT "payment_gateway_configurations_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
