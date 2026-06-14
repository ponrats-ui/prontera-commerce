-- CreateEnum
CREATE TYPE "GovernanceActionCategory" AS ENUM ('ROUTINE_OPERATION', 'STRATEGIC', 'FINANCIAL', 'LEGAL', 'COMPLIANCE', 'MODERATION', 'POLICY');

-- CreateEnum
CREATE TYPE "GovernanceRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "GovernanceApprovalStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELED', 'EXECUTED');

-- CreateTable
CREATE TABLE "governance_action_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopId" UUID,
    "requestedByUserId" UUID,
    "reviewedByUserId" UUID,
    "agentName" VARCHAR(120) NOT NULL,
    "category" "GovernanceActionCategory" NOT NULL,
    "riskLevel" "GovernanceRiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "status" "GovernanceApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "title" VARCHAR(200) NOT NULL,
    "recommendation" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "approvalReason" TEXT,
    "rejectionReason" TEXT,
    "metadata" JSONB,
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMPTZ(6),
    "executedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "governance_action_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "governance_action_reviews_shopId_status_idx" ON "governance_action_reviews"("shopId", "status");
CREATE INDEX "governance_action_reviews_category_riskLevel_idx" ON "governance_action_reviews"("category", "riskLevel");
CREATE INDEX "governance_action_reviews_agentName_idx" ON "governance_action_reviews"("agentName");
CREATE INDEX "governance_action_reviews_requestedByUserId_idx" ON "governance_action_reviews"("requestedByUserId");
CREATE INDEX "governance_action_reviews_reviewedByUserId_idx" ON "governance_action_reviews"("reviewedByUserId");
CREATE INDEX "governance_action_reviews_deletedAt_idx" ON "governance_action_reviews"("deletedAt");

-- AddCheckConstraint
ALTER TABLE "governance_action_reviews" ADD CONSTRAINT "governance_action_reviews_confidence_range_chk" CHECK ("confidence" >= 0 AND "confidence" <= 100);
ALTER TABLE "governance_action_reviews" ADD CONSTRAINT "governance_action_reviews_review_status_chk" CHECK (
    ("status" IN ('DRAFT', 'PENDING_APPROVAL') AND "reviewedByUserId" IS NULL AND "reviewedAt" IS NULL)
    OR ("status" IN ('APPROVED', 'REJECTED', 'CANCELED', 'EXECUTED') AND "reviewedByUserId" IS NOT NULL AND "reviewedAt" IS NOT NULL)
);
ALTER TABLE "governance_action_reviews" ADD CONSTRAINT "governance_action_reviews_execution_requires_approval_chk" CHECK (
    "status" <> 'EXECUTED' OR ("reviewedByUserId" IS NOT NULL AND "reviewedAt" IS NOT NULL AND "executedAt" IS NOT NULL)
);
ALTER TABLE "governance_action_reviews" ADD CONSTRAINT "governance_action_reviews_high_impact_approval_chk" CHECK (
    "category" = 'ROUTINE_OPERATION'
    OR "status" IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELED', 'EXECUTED')
);

-- AddForeignKey
ALTER TABLE "governance_action_reviews" ADD CONSTRAINT "governance_action_reviews_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "governance_action_reviews" ADD CONSTRAINT "governance_action_reviews_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "governance_action_reviews" ADD CONSTRAINT "governance_action_reviews_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
