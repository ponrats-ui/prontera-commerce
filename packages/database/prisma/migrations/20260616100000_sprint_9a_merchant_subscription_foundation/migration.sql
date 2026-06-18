-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'TRIAL';
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'GRACE_PERIOD';
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- CreateEnum
CREATE TYPE "SubscriptionPlanType" AS ENUM ('STARTER', 'PRO', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "planType" "SubscriptionPlanType" NOT NULL,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "productLimit" INTEGER,
    "monthlyOrderLimit" INTEGER,
    "liveCommerce" BOOLEAN NOT NULL DEFAULT false,
    "advancedAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "multiStaff" BOOLEAN NOT NULL DEFAULT false,
    "aiMerchantAssistant" BOOLEAN NOT NULL DEFAULT false,
    "crmAdvanced" BOOLEAN NOT NULL DEFAULT false,
    "promotionFullAccess" BOOLEAN NOT NULL DEFAULT false,
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "trialStartAt" TIMESTAMPTZ(6),
    "trialEndAt" TIMESTAMPTZ(6),
    "currentPeriodStart" TIMESTAMPTZ(6),
    "currentPeriodEnd" TIMESTAMPTZ(6),
    "upgradedAt" TIMESTAMPTZ(6),
    "cancelledAt" TIMESTAMPTZ(6),
    "gracePeriodEndAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "merchant_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founder_merchant_programs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "isFounderMerchant" BOOLEAN NOT NULL DEFAULT true,
    "founderGrantedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "founderExpiresAt" TIMESTAMPTZ(6),
    "grantedById" UUID,
    "benefits" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "founder_merchant_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE INDEX "subscription_plans_planType_idx" ON "subscription_plans"("planType");

-- CreateIndex
CREATE INDEX "subscription_plans_status_idx" ON "subscription_plans"("status");

-- CreateIndex
CREATE INDEX "subscription_plans_deletedAt_idx" ON "subscription_plans"("deletedAt");

-- CreateIndex
CREATE INDEX "merchant_subscriptions_shopId_status_idx" ON "merchant_subscriptions"("shopId", "status");

-- CreateIndex
CREATE INDEX "merchant_subscriptions_planId_idx" ON "merchant_subscriptions"("planId");

-- CreateIndex
CREATE INDEX "merchant_subscriptions_trialEndAt_idx" ON "merchant_subscriptions"("trialEndAt");

-- CreateIndex
CREATE INDEX "merchant_subscriptions_currentPeriodEnd_idx" ON "merchant_subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "merchant_subscriptions_deletedAt_idx" ON "merchant_subscriptions"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "founder_merchant_programs_shopId_key" ON "founder_merchant_programs"("shopId");

-- CreateIndex
CREATE INDEX "founder_merchant_programs_isFounderMerchant_idx" ON "founder_merchant_programs"("isFounderMerchant");

-- CreateIndex
CREATE INDEX "founder_merchant_programs_founderExpiresAt_idx" ON "founder_merchant_programs"("founderExpiresAt");

-- CreateIndex
CREATE INDEX "founder_merchant_programs_grantedById_idx" ON "founder_merchant_programs"("grantedById");

-- CreateIndex
CREATE INDEX "founder_merchant_programs_deletedAt_idx" ON "founder_merchant_programs"("deletedAt");

-- AddForeignKey
ALTER TABLE "merchant_subscriptions" ADD CONSTRAINT "merchant_subscriptions_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_subscriptions" ADD CONSTRAINT "merchant_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "founder_merchant_programs" ADD CONSTRAINT "founder_merchant_programs_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "founder_merchant_programs" ADD CONSTRAINT "founder_merchant_programs_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SeedPlans
INSERT INTO "subscription_plans" (
    "code",
    "name",
    "description",
    "planType",
    "priceCents",
    "currency",
    "productLimit",
    "monthlyOrderLimit",
    "liveCommerce",
    "advancedAnalytics",
    "multiStaff",
    "aiMerchantAssistant",
    "crmAdvanced",
    "promotionFullAccess",
    "status"
)
VALUES
    ('STARTER', 'Starter Free Forever', 'Free forever merchant plan with starter limits.', 'STARTER', 0, 'USD', 20, 50, false, false, false, false, false, false, 'ACTIVE'),
    ('PRO', 'Pro Merchant', 'Paid merchant plan for growth, live commerce, advanced CRM, promotion engine, staff, and analytics.', 'PRO', 2900, 'USD', NULL, NULL, true, true, true, true, true, true, 'ACTIVE'),
    ('ENTERPRISE', 'Enterprise Merchant', 'Custom enterprise merchant plan for larger operators.', 'ENTERPRISE', 0, 'USD', NULL, NULL, true, true, true, true, true, true, 'ACTIVE')
ON CONFLICT ("code") DO NOTHING;
