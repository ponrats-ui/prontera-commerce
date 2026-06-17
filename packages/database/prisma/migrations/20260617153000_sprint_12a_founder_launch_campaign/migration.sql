-- CreateEnum
CREATE TYPE "FounderReferralStatus" AS ENUM ('PENDING', 'CONVERTED', 'REWARDED');

-- CreateEnum
CREATE TYPE "FounderCampaignEventType" AS ENUM ('LANDING_VIEW', 'APPLY_CLICK', 'APPLICATION_SUBMITTED', 'WAITLIST_JOINED', 'REFERRAL_CAPTURED', 'STORY_INTEREST');

-- CreateTable
CREATE TABLE "founder_waitlist_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "merchantName" VARCHAR(160) NOT NULL,
    "businessName" VARCHAR(160) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "category" VARCHAR(120) NOT NULL,
    "source" VARCHAR(120),
    "referralCode" VARCHAR(80),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "founder_waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founder_referrals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referrerEmail" VARCHAR(320) NOT NULL,
    "referredEmail" VARCHAR(320) NOT NULL,
    "referralCode" VARCHAR(80) NOT NULL,
    "status" "FounderReferralStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "founder_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founder_campaign_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eventType" "FounderCampaignEventType" NOT NULL,
    "source" VARCHAR(120),
    "campaign" VARCHAR(120),
    "referralCode" VARCHAR(80),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "founder_campaign_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "founder_waitlist_entries_email_idx" ON "founder_waitlist_entries"("email");
CREATE INDEX "founder_waitlist_entries_category_idx" ON "founder_waitlist_entries"("category");
CREATE INDEX "founder_waitlist_entries_source_idx" ON "founder_waitlist_entries"("source");
CREATE INDEX "founder_waitlist_entries_referralCode_idx" ON "founder_waitlist_entries"("referralCode");
CREATE INDEX "founder_waitlist_entries_createdAt_idx" ON "founder_waitlist_entries"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "founder_referrals_referrerEmail_referredEmail_key" ON "founder_referrals"("referrerEmail", "referredEmail");
CREATE INDEX "founder_referrals_referralCode_idx" ON "founder_referrals"("referralCode");
CREATE INDEX "founder_referrals_status_idx" ON "founder_referrals"("status");
CREATE INDEX "founder_referrals_createdAt_idx" ON "founder_referrals"("createdAt");

-- CreateIndex
CREATE INDEX "founder_campaign_events_eventType_idx" ON "founder_campaign_events"("eventType");
CREATE INDEX "founder_campaign_events_source_idx" ON "founder_campaign_events"("source");
CREATE INDEX "founder_campaign_events_campaign_idx" ON "founder_campaign_events"("campaign");
CREATE INDEX "founder_campaign_events_referralCode_idx" ON "founder_campaign_events"("referralCode");
CREATE INDEX "founder_campaign_events_createdAt_idx" ON "founder_campaign_events"("createdAt");
