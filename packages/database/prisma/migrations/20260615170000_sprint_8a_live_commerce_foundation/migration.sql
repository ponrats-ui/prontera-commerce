-- CreateEnum
CREATE TYPE "LiveChannelProvider" AS ENUM ('YOUTUBE', 'FACEBOOK', 'TIKTOK', 'CUSTOM_EMBED');

-- CreateEnum
CREATE TYPE "LiveChannelStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'LIVE', 'ENDED', 'DISABLED');

-- CreateTable
CREATE TABLE "shop_live_channels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "provider" "LiveChannelProvider" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "status" "LiveChannelStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMPTZ(6),
    "endsAt" TIMESTAMPTZ(6),
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "shop_live_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shop_live_channels_shopId_status_idx" ON "shop_live_channels"("shopId", "status");

-- CreateIndex
CREATE INDEX "shop_live_channels_provider_idx" ON "shop_live_channels"("provider");

-- CreateIndex
CREATE INDEX "shop_live_channels_createdById_idx" ON "shop_live_channels"("createdById");

-- CreateIndex
CREATE INDEX "shop_live_channels_startsAt_idx" ON "shop_live_channels"("startsAt");

-- CreateIndex
CREATE INDEX "shop_live_channels_deletedAt_idx" ON "shop_live_channels"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "shop_live_channels_one_live_per_shop_key" ON "shop_live_channels"("shopId") WHERE "deletedAt" IS NULL AND "status" = 'LIVE';

-- AddForeignKey
ALTER TABLE "shop_live_channels" ADD CONSTRAINT "shop_live_channels_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_live_channels" ADD CONSTRAINT "shop_live_channels_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
