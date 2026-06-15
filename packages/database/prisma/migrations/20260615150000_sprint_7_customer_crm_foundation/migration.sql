-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CustomerSource" AS ENUM ('POS', 'ONLINE', 'MANUAL', 'IMPORTED');

-- CreateEnum
CREATE TYPE "CustomerGroupStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CustomerTagStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CustomerNoteVisibility" AS ENUM ('INTERNAL', 'MANAGER_ONLY');

-- CreateEnum
CREATE TYPE "CustomerActivityType" AS ENUM ('customer_created', 'customer_updated', 'address_added', 'note_added', 'group_assigned', 'tag_assigned', 'order_created_reference');

-- CreateEnum
CREATE TYPE "CustomerLoyaltyTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "CustomerLoyaltyStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "firstName" VARCHAR(120),
    "lastName" VARCHAR(120),
    "displayName" VARCHAR(200) NOT NULL,
    "email" VARCHAR(320),
    "normalizedEmail" VARCHAR(320),
    "phone" VARCHAR(40),
    "normalizedPhone" VARCHAR(40),
    "birthDate" DATE,
    "gender" VARCHAR(40),
    "preferredLocale" VARCHAR(35),
    "preferredCurrency" CHAR(3),
    "countryCode" CHAR(2),
    "timeZone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" "CustomerSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "label" VARCHAR(80),
    "recipientName" VARCHAR(200),
    "phone" VARCHAR(40),
    "addressLine1" VARCHAR(240) NOT NULL,
    "addressLine2" VARCHAR(240),
    "district" VARCHAR(120),
    "province" VARCHAR(120),
    "postalCode" VARCHAR(40),
    "countryCode" CHAR(2) NOT NULL,
    "isDefaultShipping" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultBilling" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "status" "CustomerGroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_group_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customer_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "color" VARCHAR(32),
    "status" "CustomerTagStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customer_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_tag_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customer_tag_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "authorId" UUID,
    "note" TEXT NOT NULL,
    "visibility" "CustomerNoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customer_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "type" "CustomerActivityType" NOT NULL,
    "metadata" JSONB,
    "performedBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_loyalty_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
    "tier" "CustomerLoyaltyTier" NOT NULL DEFAULT 'BRONZE',
    "status" "CustomerLoyaltyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customer_loyalty_accounts_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "customerProfileId" UUID;

-- CreateIndex
CREATE INDEX "customers_shopId_status_idx" ON "customers"("shopId", "status");
CREATE INDEX "customers_shopId_normalizedEmail_idx" ON "customers"("shopId", "normalizedEmail");
CREATE INDEX "customers_shopId_normalizedPhone_idx" ON "customers"("shopId", "normalizedPhone");
CREATE INDEX "customers_preferredLocale_idx" ON "customers"("preferredLocale");
CREATE INDEX "customers_preferredCurrency_idx" ON "customers"("preferredCurrency");
CREATE INDEX "customers_countryCode_idx" ON "customers"("countryCode");
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");
CREATE INDEX "customer_addresses_customerId_idx" ON "customer_addresses"("customerId");
CREATE INDEX "customer_addresses_countryCode_idx" ON "customer_addresses"("countryCode");
CREATE INDEX "customer_addresses_deletedAt_idx" ON "customer_addresses"("deletedAt");
CREATE INDEX "customer_groups_shopId_status_idx" ON "customer_groups"("shopId", "status");
CREATE INDEX "customer_groups_deletedAt_idx" ON "customer_groups"("deletedAt");
CREATE INDEX "customer_group_members_customerId_idx" ON "customer_group_members"("customerId");
CREATE INDEX "customer_group_members_groupId_idx" ON "customer_group_members"("groupId");
CREATE INDEX "customer_group_members_deletedAt_idx" ON "customer_group_members"("deletedAt");
CREATE INDEX "customer_tags_shopId_status_idx" ON "customer_tags"("shopId", "status");
CREATE INDEX "customer_tags_deletedAt_idx" ON "customer_tags"("deletedAt");
CREATE INDEX "customer_tag_assignments_customerId_idx" ON "customer_tag_assignments"("customerId");
CREATE INDEX "customer_tag_assignments_tagId_idx" ON "customer_tag_assignments"("tagId");
CREATE INDEX "customer_tag_assignments_deletedAt_idx" ON "customer_tag_assignments"("deletedAt");
CREATE INDEX "customer_notes_customerId_idx" ON "customer_notes"("customerId");
CREATE INDEX "customer_notes_authorId_idx" ON "customer_notes"("authorId");
CREATE INDEX "customer_notes_deletedAt_idx" ON "customer_notes"("deletedAt");
CREATE INDEX "customer_activities_customerId_type_idx" ON "customer_activities"("customerId", "type");
CREATE INDEX "customer_activities_performedBy_idx" ON "customer_activities"("performedBy");
CREATE UNIQUE INDEX "customer_loyalty_accounts_customerId_key" ON "customer_loyalty_accounts"("customerId");
CREATE INDEX "customer_loyalty_accounts_status_idx" ON "customer_loyalty_accounts"("status");
CREATE INDEX "customer_loyalty_accounts_tier_idx" ON "customer_loyalty_accounts"("tier");
CREATE INDEX "customer_loyalty_accounts_deletedAt_idx" ON "customer_loyalty_accounts"("deletedAt");
CREATE INDEX "orders_customerProfileId_idx" ON "orders"("customerProfileId");

-- Soft-delete-aware uniqueness
CREATE UNIQUE INDEX "customers_shopId_normalizedEmail_active_key" ON "customers"("shopId", "normalizedEmail") WHERE "deletedAt" IS NULL AND "normalizedEmail" IS NOT NULL;
CREATE UNIQUE INDEX "customers_shopId_normalizedPhone_active_key" ON "customers"("shopId", "normalizedPhone") WHERE "deletedAt" IS NULL AND "normalizedPhone" IS NOT NULL;
CREATE UNIQUE INDEX "customer_addresses_default_shipping_key" ON "customer_addresses"("customerId") WHERE "deletedAt" IS NULL AND "isDefaultShipping" = true;
CREATE UNIQUE INDEX "customer_addresses_default_billing_key" ON "customer_addresses"("customerId") WHERE "deletedAt" IS NULL AND "isDefaultBilling" = true;
CREATE UNIQUE INDEX "customer_groups_shopId_name_active_key" ON "customer_groups"("shopId", "name") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "customer_tags_shopId_name_active_key" ON "customer_tags"("shopId", "name") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "customer_group_members_customerId_groupId_active_key" ON "customer_group_members"("customerId", "groupId") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "customer_tag_assignments_customerId_tagId_active_key" ON "customer_tag_assignments"("customerId", "tagId") WHERE "deletedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_preferredLocale_fkey" FOREIGN KEY ("preferredLocale") REFERENCES "locales"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_preferredCurrency_fkey" FOREIGN KEY ("preferredCurrency") REFERENCES "currencies"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_groups" ADD CONSTRAINT "customer_groups_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_group_members" ADD CONSTRAINT "customer_group_members_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_group_members" ADD CONSTRAINT "customer_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_tag_assignments" ADD CONSTRAINT "customer_tag_assignments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_tag_assignments" ADD CONSTRAINT "customer_tag_assignments_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "customer_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_activities" ADD CONSTRAINT "customer_activities_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_activities" ADD CONSTRAINT "customer_activities_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_loyalty_accounts" ADD CONSTRAINT "customer_loyalty_accounts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
