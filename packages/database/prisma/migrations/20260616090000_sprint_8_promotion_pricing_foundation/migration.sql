-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENT_DISCOUNT', 'FIXED_DISCOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING_PLACEHOLDER', 'CUSTOMER_GROUP_DISCOUNT');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PricingTierStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "appliedPromotionSnapshot" JSONB;

-- CreateTable
CREATE TABLE "promotion_campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "promotionType" "PromotionType" NOT NULL,
    "status" "PromotionStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMPTZ(6),
    "endsAt" TIMESTAMPTZ(6),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "promotion_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaignId" UUID NOT NULL,
    "minimumOrderAmount" INTEGER,
    "minimumQuantity" INTEGER,
    "discountPercent" INTEGER,
    "discountAmount" INTEGER,
    "buyQuantity" INTEGER,
    "getQuantity" INTEGER,
    "targetProductId" UUID,
    "targetCategoryId" UUID,
    "targetCustomerGroupId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "promotion_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "status" "VoucherStatus" NOT NULL DEFAULT 'DRAFT',
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMPTZ(6),
    "endsAt" TIMESTAMPTZ(6),
    "campaignId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_pricing_tiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "customerGroupId" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "status" "PricingTierStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customer_pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotion_campaigns_shopId_status_idx" ON "promotion_campaigns"("shopId", "status");

-- CreateIndex
CREATE INDEX "promotion_campaigns_promotionType_idx" ON "promotion_campaigns"("promotionType");

-- CreateIndex
CREATE INDEX "promotion_campaigns_startsAt_idx" ON "promotion_campaigns"("startsAt");

-- CreateIndex
CREATE INDEX "promotion_campaigns_endsAt_idx" ON "promotion_campaigns"("endsAt");

-- CreateIndex
CREATE INDEX "promotion_campaigns_priority_idx" ON "promotion_campaigns"("priority");

-- CreateIndex
CREATE INDEX "promotion_campaigns_createdById_idx" ON "promotion_campaigns"("createdById");

-- CreateIndex
CREATE INDEX "promotion_campaigns_deletedAt_idx" ON "promotion_campaigns"("deletedAt");

-- CreateIndex
CREATE INDEX "promotion_rules_campaignId_idx" ON "promotion_rules"("campaignId");

-- CreateIndex
CREATE INDEX "promotion_rules_targetProductId_idx" ON "promotion_rules"("targetProductId");

-- CreateIndex
CREATE INDEX "promotion_rules_targetCategoryId_idx" ON "promotion_rules"("targetCategoryId");

-- CreateIndex
CREATE INDEX "promotion_rules_targetCustomerGroupId_idx" ON "promotion_rules"("targetCustomerGroupId");

-- CreateIndex
CREATE INDEX "promotion_rules_deletedAt_idx" ON "promotion_rules"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_shopId_code_key" ON "vouchers"("shopId", "code");

-- CreateIndex
CREATE INDEX "vouchers_shopId_status_idx" ON "vouchers"("shopId", "status");

-- CreateIndex
CREATE INDEX "vouchers_campaignId_idx" ON "vouchers"("campaignId");

-- CreateIndex
CREATE INDEX "vouchers_startsAt_idx" ON "vouchers"("startsAt");

-- CreateIndex
CREATE INDEX "vouchers_endsAt_idx" ON "vouchers"("endsAt");

-- CreateIndex
CREATE INDEX "vouchers_deletedAt_idx" ON "vouchers"("deletedAt");

-- CreateIndex
CREATE INDEX "customer_pricing_tiers_shopId_status_idx" ON "customer_pricing_tiers"("shopId", "status");

-- CreateIndex
CREATE INDEX "customer_pricing_tiers_customerGroupId_idx" ON "customer_pricing_tiers"("customerGroupId");

-- CreateIndex
CREATE INDEX "customer_pricing_tiers_deletedAt_idx" ON "customer_pricing_tiers"("deletedAt");

-- AddForeignKey
ALTER TABLE "promotion_campaigns" ADD CONSTRAINT "promotion_campaigns_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_campaigns" ADD CONSTRAINT "promotion_campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rules" ADD CONSTRAINT "promotion_rules_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "promotion_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rules" ADD CONSTRAINT "promotion_rules_targetProductId_fkey" FOREIGN KEY ("targetProductId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rules" ADD CONSTRAINT "promotion_rules_targetCategoryId_fkey" FOREIGN KEY ("targetCategoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rules" ADD CONSTRAINT "promotion_rules_targetCustomerGroupId_fkey" FOREIGN KEY ("targetCustomerGroupId") REFERENCES "customer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "promotion_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_pricing_tiers" ADD CONSTRAINT "customer_pricing_tiers_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_pricing_tiers" ADD CONSTRAINT "customer_pricing_tiers_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
