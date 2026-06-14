-- CreateEnum
CREATE TYPE "WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InventoryItemStatus" AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('INBOUND', 'OUTBOUND', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'RESERVATION', 'RELEASE');

-- CreateEnum
CREATE TYPE "InventoryAdjustmentReason" AS ENUM ('COUNT_CORRECTION', 'DAMAGED', 'LOST', 'EXPIRED', 'MANUAL');

-- CreateEnum
CREATE TYPE "InventoryReservationStatus" AS ENUM ('ACTIVE', 'RELEASED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InventoryAlertType" AS ENUM ('LOW_STOCK', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "InventoryAlertStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "address" TEXT,
    "countryCode" CHAR(2) NOT NULL,
    "timeZone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
    "status" "WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "warehouseId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "sku" VARCHAR(120) NOT NULL,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "reorderQuantity" INTEGER NOT NULL DEFAULT 0,
    "status" "InventoryItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inventoryItemId" UUID NOT NULL,
    "movementType" "InventoryMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "referenceNumber" VARCHAR(120),
    "notes" TEXT,
    "performedBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_adjustments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inventoryItemId" UUID NOT NULL,
    "reason" "InventoryAdjustmentReason" NOT NULL,
    "beforeQuantity" INTEGER NOT NULL,
    "afterQuantity" INTEGER NOT NULL,
    "notes" TEXT,
    "performedBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inventoryItemId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "InventoryReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "inventory_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inventoryItemId" UUID NOT NULL,
    "alertType" "InventoryAlertType" NOT NULL,
    "threshold" INTEGER NOT NULL,
    "currentQuantity" INTEGER NOT NULL,
    "status" "InventoryAlertStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "inventory_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "warehouses_shopId_status_idx" ON "warehouses"("shopId", "status");
CREATE INDEX "warehouses_countryCode_idx" ON "warehouses"("countryCode");
CREATE INDEX "warehouses_deletedAt_idx" ON "warehouses"("deletedAt");
CREATE UNIQUE INDEX "warehouses_shopId_code_active_key" ON "warehouses"("shopId", "code") WHERE "deletedAt" IS NULL;

CREATE INDEX "inventory_items_warehouseId_status_idx" ON "inventory_items"("warehouseId", "status");
CREATE INDEX "inventory_items_productVariantId_idx" ON "inventory_items"("productVariantId");
CREATE INDEX "inventory_items_sku_idx" ON "inventory_items"("sku");
CREATE INDEX "inventory_items_deletedAt_idx" ON "inventory_items"("deletedAt");
CREATE UNIQUE INDEX "inventory_items_warehouseId_productVariantId_active_key" ON "inventory_items"("warehouseId", "productVariantId") WHERE "deletedAt" IS NULL;

CREATE INDEX "inventory_movements_inventoryItemId_movementType_idx" ON "inventory_movements"("inventoryItemId", "movementType");
CREATE INDEX "inventory_movements_referenceNumber_idx" ON "inventory_movements"("referenceNumber");
CREATE INDEX "inventory_movements_performedBy_idx" ON "inventory_movements"("performedBy");

CREATE INDEX "inventory_adjustments_inventoryItemId_reason_idx" ON "inventory_adjustments"("inventoryItemId", "reason");
CREATE INDEX "inventory_adjustments_performedBy_idx" ON "inventory_adjustments"("performedBy");

CREATE INDEX "inventory_reservations_inventoryItemId_status_idx" ON "inventory_reservations"("inventoryItemId", "status");
CREATE INDEX "inventory_reservations_expiresAt_idx" ON "inventory_reservations"("expiresAt");
CREATE INDEX "inventory_reservations_deletedAt_idx" ON "inventory_reservations"("deletedAt");

CREATE INDEX "inventory_alerts_inventoryItemId_status_idx" ON "inventory_alerts"("inventoryItemId", "status");
CREATE INDEX "inventory_alerts_alertType_status_idx" ON "inventory_alerts"("alertType", "status");
CREATE INDEX "inventory_alerts_deletedAt_idx" ON "inventory_alerts"("deletedAt");

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_alerts" ADD CONSTRAINT "inventory_alerts_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
