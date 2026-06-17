CREATE TYPE "MerchantBuildingType" AS ENUM (
  'CLASSIC_SHOP',
  'MODERN_SHOP',
  'MARKET_STALL',
  'TECH_STORE',
  'PREMIUM_HALL'
);

CREATE TABLE "merchant_buildings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shopId" UUID NOT NULL,
  "districtId" UUID NOT NULL,
  "buildingType" "MerchantBuildingType" NOT NULL DEFAULT 'CLASSIC_SHOP',
  "storefrontTheme" "StorefrontTheme" NOT NULL DEFAULT 'WARM_MARKET',
  "xCoordinate" INTEGER NOT NULL,
  "yCoordinate" INTEGER NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "merchant_buildings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "merchant_buildings_shopId_key" ON "merchant_buildings"("shopId");
CREATE INDEX "merchant_buildings_districtId_idx" ON "merchant_buildings"("districtId");
CREATE INDEX "merchant_buildings_isPublished_idx" ON "merchant_buildings"("isPublished");

ALTER TABLE "merchant_buildings"
  ADD CONSTRAINT "merchant_buildings_shopId_fkey"
  FOREIGN KEY ("shopId") REFERENCES "shops"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "merchant_buildings"
  ADD CONSTRAINT "merchant_buildings_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "world_districts"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "world_zones" ("id", "code", "name", "description", "status", "sortOrder", "updatedAt")
VALUES
  ('30000000-0000-4000-8000-000000000001', 'MERCHANT_WORLD', 'Merchant World', 'Core onboarding zone for new merchant storefronts.', 'ACTIVE', 1, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "world_districts" ("id", "zoneId", "code", "name", "description", "category", "sortOrder", "updatedAt")
VALUES
  ('31000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'TECH_BAZAAR', 'Tech Bazaar', 'Technology merchants, digital service providers, gadgets, and AI-assisted commerce tools.', 'TECH', 1, CURRENT_TIMESTAMP),
  ('31000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'ARTISAN_VALLEY', 'Artisan Valley', 'Handcrafted products, makers, boutique shops, and story-rich merchant identities.', 'ARTISAN', 2, CURRENT_TIMESTAMP),
  ('31000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001', 'HARBOR_DISTRICT', 'Harbor District', 'Trade route merchants, regional goods, imports, exports, and logistics-adjacent commerce.', 'HARBOR', 3, CURRENT_TIMESTAMP),
  ('31000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000001', 'WHOLESALE_QUARTER', 'Wholesale Quarter', 'Bulk orders, distributor catalogs, procurement, and B2B merchant trade.', 'WHOLESALE', 4, CURRENT_TIMESTAMP)
ON CONFLICT ("zoneId", "code") DO NOTHING;

INSERT INTO "world_regions" ("id", "name", "slug", "description", "status", "displayOrder", "updatedAt")
VALUES
  ('10000000-0000-4000-8000-000000000001', 'Central Trade Region', 'central-trade-region', 'The first commerce region for visible merchant discovery.', 'ACTIVE', 1, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "world_cities" ("id", "regionId", "name", "slug", "description", "status", "updatedAt")
VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Merchant City', 'merchant-city', 'A central market city for everyday shops and business discovery.', 'ACTIVE', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "world_district_locations" ("districtId", "cityId", "coordinateX", "coordinateY", "displayOrder")
VALUES
  ('31000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 68, 42, 1),
  ('31000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 34, 58, 2),
  ('31000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 22, 76, 3),
  ('31000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', 74, 72, 4)
ON CONFLICT ("districtId", "cityId") DO NOTHING;

