CREATE TYPE "WorldEntityStatus" AS ENUM ('ACTIVE', 'DISABLED');

CREATE TYPE "MerchantBuildingStyle" AS ENUM (
  'CLASSIC_SHOP',
  'MODERN_SHOP',
  'MARKET_STALL',
  'TECH_STORE',
  'PREMIUM_HALL'
);

CREATE TYPE "StorefrontTheme" AS ENUM (
  'WARM_MARKET',
  'HARBOR_TRADE',
  'ARTISAN_LIGHT',
  'TECH_BAZAAR',
  'FOUNDER_GOLD'
);

CREATE TABLE "world_regions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(160) NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "description" TEXT,
  "status" "WorldEntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "world_regions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "world_cities" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "regionId" UUID NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "description" TEXT,
  "mapImageUrl" TEXT,
  "status" "WorldEntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "world_cities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "world_district_locations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "districtId" UUID NOT NULL,
  "cityId" UUID NOT NULL,
  "coordinateX" INTEGER NOT NULL,
  "coordinateY" INTEGER NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "world_district_locations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "merchant_world_locations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shopId" UUID NOT NULL,
  "cityId" UUID NOT NULL,
  "districtId" UUID NOT NULL,
  "buildingStyle" "MerchantBuildingStyle" NOT NULL DEFAULT 'CLASSIC_SHOP',
  "storefrontTheme" "StorefrontTheme" NOT NULL DEFAULT 'WARM_MARKET',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "founderPlacement" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "merchant_world_locations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "world_regions_slug_key" ON "world_regions"("slug");
CREATE INDEX "world_regions_status_idx" ON "world_regions"("status");
CREATE INDEX "world_regions_displayOrder_idx" ON "world_regions"("displayOrder");

CREATE UNIQUE INDEX "world_cities_slug_key" ON "world_cities"("slug");
CREATE INDEX "world_cities_regionId_idx" ON "world_cities"("regionId");
CREATE INDEX "world_cities_status_idx" ON "world_cities"("status");

CREATE UNIQUE INDEX "world_district_locations_districtId_cityId_key" ON "world_district_locations"("districtId", "cityId");
CREATE INDEX "world_district_locations_cityId_displayOrder_idx" ON "world_district_locations"("cityId", "displayOrder");
CREATE INDEX "world_district_locations_districtId_idx" ON "world_district_locations"("districtId");

CREATE UNIQUE INDEX "merchant_world_locations_shopId_key" ON "merchant_world_locations"("shopId");
CREATE INDEX "merchant_world_locations_cityId_idx" ON "merchant_world_locations"("cityId");
CREATE INDEX "merchant_world_locations_districtId_idx" ON "merchant_world_locations"("districtId");
CREATE INDEX "merchant_world_locations_featured_idx" ON "merchant_world_locations"("featured");
CREATE INDEX "merchant_world_locations_founderPlacement_idx" ON "merchant_world_locations"("founderPlacement");

ALTER TABLE "world_cities"
  ADD CONSTRAINT "world_cities_regionId_fkey"
  FOREIGN KEY ("regionId") REFERENCES "world_regions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "world_district_locations"
  ADD CONSTRAINT "world_district_locations_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "world_districts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "world_district_locations"
  ADD CONSTRAINT "world_district_locations_cityId_fkey"
  FOREIGN KEY ("cityId") REFERENCES "world_cities"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "merchant_world_locations"
  ADD CONSTRAINT "merchant_world_locations_shopId_fkey"
  FOREIGN KEY ("shopId") REFERENCES "shops"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "merchant_world_locations"
  ADD CONSTRAINT "merchant_world_locations_cityId_fkey"
  FOREIGN KEY ("cityId") REFERENCES "world_cities"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "merchant_world_locations"
  ADD CONSTRAINT "merchant_world_locations_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "world_districts"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "world_regions" ("id", "name", "slug", "description", "status", "displayOrder", "updatedAt")
VALUES
  ('10000000-0000-4000-8000-000000000001', 'Central Trade Region', 'central-trade-region', 'The first commerce region for visible merchant discovery.', 'ACTIVE', 1, CURRENT_TIMESTAMP),
  ('10000000-0000-4000-8000-000000000002', 'Creative Commerce Region', 'creative-commerce-region', 'A foundation region for creators, artisans, founders, and specialized trade.', 'ACTIVE', 2, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "world_cities" ("id", "regionId", "name", "slug", "description", "status", "updatedAt")
VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Merchant City', 'merchant-city', 'A central market city for everyday shops and business discovery.', 'ACTIVE', CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Harbor Market', 'harbor-market', 'A trade route city for importers, exporters, food sellers, and regional merchants.', 'ACTIVE', CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'Artisan Valley', 'artisan-valley', 'A handcrafted commerce city for makers, boutique products, and local craft.', 'ACTIVE', CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'Tech Bazaar', 'tech-bazaar', 'A modern commerce city for technology stores and service merchants.', 'ACTIVE', CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', 'Wholesale Quarter', 'wholesale-quarter', 'A business-ready city for bulk orders, distributor catalogs, and B2B commerce.', 'ACTIVE', CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000002', 'Creator Square', 'creator-square', 'A live commerce city for creator-led shops and product storytelling.', 'ACTIVE', CURRENT_TIMESTAMP),
  ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000002', 'Founder District', 'founder-district', 'A priority commerce city for Founder Merchants and early platform builders.', 'ACTIVE', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
