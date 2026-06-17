CREATE TYPE "MerchantDiscoveryEventType" AS ENUM (
  'DISCOVERY_VIEW',
  'MERCHANT_SEARCH',
  'MERCHANT_CLICK',
  'CATEGORY_FILTER',
  'FOUNDER_FILTER',
  'OFFICIAL_FILTER',
  'FEATURED_FILTER'
);

CREATE TABLE "merchant_discovery_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "eventType" "MerchantDiscoveryEventType" NOT NULL,
  "shopId" UUID,
  "searchTerm" VARCHAR(160),
  "category" VARCHAR(80),
  "source" VARCHAR(120),
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "merchant_discovery_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "merchant_discovery_events_eventType_idx" ON "merchant_discovery_events"("eventType");
CREATE INDEX "merchant_discovery_events_shopId_idx" ON "merchant_discovery_events"("shopId");
CREATE INDEX "merchant_discovery_events_category_idx" ON "merchant_discovery_events"("category");
CREATE INDEX "merchant_discovery_events_source_idx" ON "merchant_discovery_events"("source");
CREATE INDEX "merchant_discovery_events_createdAt_idx" ON "merchant_discovery_events"("createdAt");

ALTER TABLE "merchant_discovery_events"
  ADD CONSTRAINT "merchant_discovery_events_shopId_fkey"
  FOREIGN KEY ("shopId") REFERENCES "shops"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
