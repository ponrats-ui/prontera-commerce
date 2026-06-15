-- CreateEnum
CREATE TYPE "WorldZoneStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "CommerceGateType" AS ENUM ('CITY_GATE', 'DISTRICT_GATE', 'SPECIAL_GATE');

-- CreateEnum
CREATE TYPE "CommerceGateStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "world_zones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "status" "WorldZoneStatus" NOT NULL DEFAULT 'ACTIVE',
    "thumbnailUrl" TEXT,
    "mapImageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "world_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_districts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "zoneId" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(80) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "world_districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_gates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceZoneId" UUID NOT NULL,
    "destinationZoneId" UUID NOT NULL,
    "sourceDistrictId" UUID,
    "destinationDistrictId" UUID,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "gateType" "CommerceGateType" NOT NULL,
    "status" "CommerceGateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "commerce_gates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "world_zones_code_key" ON "world_zones"("code");

-- CreateIndex
CREATE INDEX "world_zones_status_idx" ON "world_zones"("status");

-- CreateIndex
CREATE INDEX "world_zones_sortOrder_idx" ON "world_zones"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "world_districts_zoneId_code_key" ON "world_districts"("zoneId", "code");

-- CreateIndex
CREATE INDEX "world_districts_zoneId_idx" ON "world_districts"("zoneId");

-- CreateIndex
CREATE INDEX "world_districts_category_idx" ON "world_districts"("category");

-- CreateIndex
CREATE INDEX "world_districts_sortOrder_idx" ON "world_districts"("sortOrder");

-- CreateIndex
CREATE INDEX "commerce_gates_sourceZoneId_idx" ON "commerce_gates"("sourceZoneId");

-- CreateIndex
CREATE INDEX "commerce_gates_destinationZoneId_idx" ON "commerce_gates"("destinationZoneId");

-- CreateIndex
CREATE INDEX "commerce_gates_sourceDistrictId_idx" ON "commerce_gates"("sourceDistrictId");

-- CreateIndex
CREATE INDEX "commerce_gates_destinationDistrictId_idx" ON "commerce_gates"("destinationDistrictId");

-- CreateIndex
CREATE INDEX "commerce_gates_gateType_idx" ON "commerce_gates"("gateType");

-- CreateIndex
CREATE INDEX "commerce_gates_status_idx" ON "commerce_gates"("status");

-- AddForeignKey
ALTER TABLE "world_districts" ADD CONSTRAINT "world_districts_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "world_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_gates" ADD CONSTRAINT "commerce_gates_sourceZoneId_fkey" FOREIGN KEY ("sourceZoneId") REFERENCES "world_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_gates" ADD CONSTRAINT "commerce_gates_destinationZoneId_fkey" FOREIGN KEY ("destinationZoneId") REFERENCES "world_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_gates" ADD CONSTRAINT "commerce_gates_sourceDistrictId_fkey" FOREIGN KEY ("sourceDistrictId") REFERENCES "world_districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_gates" ADD CONSTRAINT "commerce_gates_destinationDistrictId_fkey" FOREIGN KEY ("destinationDistrictId") REFERENCES "world_districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
