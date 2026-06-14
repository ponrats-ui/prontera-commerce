-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShopStaffRole" AS ENUM ('OWNER', 'MANAGER', 'CASHIER', 'STAFF');

-- CreateEnum
CREATE TYPE "ShopInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED');

-- AlterTable
ALTER TABLE "shops"
ADD COLUMN "description" TEXT,
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "bannerUrl" TEXT,
ADD COLUMN "contactEmail" VARCHAR(320),
ADD COLUMN "contactPhone" VARCHAR(40),
ADD COLUMN "status" "ShopStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "preferredLocale" VARCHAR(35),
ADD COLUMN "preferredCurrency" CHAR(3);

UPDATE "shops"
SET
    "preferredLocale" = "localeCode",
    "preferredCurrency" = "currencyCode"
WHERE "preferredLocale" IS NULL OR "preferredCurrency" IS NULL;

-- AlterTable
ALTER TABLE "shop_staff"
ADD COLUMN "role" "ShopStaffRole" NOT NULL DEFAULT 'STAFF';

UPDATE "shop_staff"
SET "role" = 'OWNER'
WHERE "status" = 'ACTIVE' AND "deletedAt" IS NULL;

-- CreateTable
CREATE TABLE "shop_invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "role" "ShopStaffRole" NOT NULL,
    "status" "ShopInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "shop_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shops_status_idx" ON "shops"("status");
CREATE INDEX "shops_isPublic_idx" ON "shops"("isPublic");
CREATE INDEX "shops_preferredLocale_idx" ON "shops"("preferredLocale");
CREATE INDEX "shops_preferredCurrency_idx" ON "shops"("preferredCurrency");
CREATE INDEX "shop_staff_shopId_role_idx" ON "shop_staff"("shopId", "role");
CREATE INDEX "shop_invitations_shopId_status_idx" ON "shop_invitations"("shopId", "status");
CREATE INDEX "shop_invitations_email_idx" ON "shop_invitations"("email");
CREATE INDEX "shop_invitations_expiresAt_idx" ON "shop_invitations"("expiresAt");
CREATE INDEX "shop_invitations_deletedAt_idx" ON "shop_invitations"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "shop_invitations_shopId_email_pending_key" ON "shop_invitations"("shopId", LOWER("email")) WHERE "status" = 'PENDING' AND "deletedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_preferredLocale_fkey" FOREIGN KEY ("preferredLocale") REFERENCES "locales"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shops" ADD CONSTRAINT "shops_preferredCurrency_fkey" FOREIGN KEY ("preferredCurrency") REFERENCES "currencies"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shop_invitations" ADD CONSTRAINT "shop_invitations_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
