-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'OFFICIAL');

-- Extend StorefrontTheme for the Sprint 12 visual identity vocabulary.
ALTER TYPE "StorefrontTheme" ADD VALUE IF NOT EXISTS 'CLASSIC';
ALTER TYPE "StorefrontTheme" ADD VALUE IF NOT EXISTS 'MODERN';
ALTER TYPE "StorefrontTheme" ADD VALUE IF NOT EXISTS 'TECH';
ALTER TYPE "StorefrontTheme" ADD VALUE IF NOT EXISTS 'ARTISAN';
ALTER TYPE "StorefrontTheme" ADD VALUE IF NOT EXISTS 'HARBOR';
ALTER TYPE "StorefrontTheme" ADD VALUE IF NOT EXISTS 'WHOLESALE';

-- AlterTable
ALTER TABLE "merchant_buildings" ADD COLUMN "buildingLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "signText" VARCHAR(160),
ADD COLUMN "bannerUrl" TEXT,
ADD COLUMN "isFounder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isOfficialStore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isLive" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "merchant_buildings" ALTER COLUMN "buildingType" DROP DEFAULT;
ALTER TABLE "merchant_buildings" ALTER COLUMN "buildingType" TYPE "BuildingType" USING (
  CASE
    WHEN "buildingType"::text = 'PREMIUM_HALL' THEN 'LARGE'
    WHEN "buildingType"::text = 'TECH_STORE' THEN 'MEDIUM'
    WHEN "buildingType"::text = 'MODERN_SHOP' THEN 'MEDIUM'
    ELSE 'SMALL'
  END
)::"BuildingType";
ALTER TABLE "merchant_buildings" ALTER COLUMN "buildingType" SET DEFAULT 'SMALL';
ALTER TABLE "merchant_buildings" ALTER COLUMN "storefrontTheme" SET DEFAULT 'CLASSIC';

UPDATE "merchant_buildings" AS building
SET
  "signText" = shop."name",
  "logoUrl" = shop."logoUrl",
  "bannerUrl" = shop."bannerUrl",
  "isFounder" = founder."isFounderMerchant",
  "isLive" = live."id" IS NOT NULL
FROM "shops" AS shop
LEFT JOIN "founder_merchant_programs" AS founder
  ON founder."shopId" = shop."id" AND founder."deletedAt" IS NULL
LEFT JOIN "shop_live_channels" AS live
  ON live."shopId" = shop."id" AND live."status" = 'LIVE' AND live."deletedAt" IS NULL
WHERE building."shopId" = shop."id";

-- CreateIndex
CREATE INDEX "merchant_buildings_buildingType_idx" ON "merchant_buildings"("buildingType");

-- CreateIndex
CREATE INDEX "merchant_buildings_isFounder_idx" ON "merchant_buildings"("isFounder");

-- CreateIndex
CREATE INDEX "merchant_buildings_isOfficialStore_idx" ON "merchant_buildings"("isOfficialStore");

-- CreateIndex
CREATE INDEX "merchant_buildings_isLive_idx" ON "merchant_buildings"("isLive");
