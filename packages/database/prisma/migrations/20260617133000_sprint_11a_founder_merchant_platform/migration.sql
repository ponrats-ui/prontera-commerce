-- CreateEnum
CREATE TYPE "FounderApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "founder_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "merchantName" VARCHAR(160) NOT NULL,
    "businessName" VARCHAR(160) NOT NULL,
    "businessType" VARCHAR(120) NOT NULL,
    "category" VARCHAR(120) NOT NULL,
    "website" TEXT,
    "facebookPage" TEXT,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "motivation" TEXT NOT NULL,
    "status" "FounderApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" UUID,
    "reviewNotes" TEXT,
    "submittedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMPTZ(6),

    CONSTRAINT "founder_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "founder_applications_status_idx" ON "founder_applications"("status");

-- CreateIndex
CREATE INDEX "founder_applications_email_idx" ON "founder_applications"("email");

-- CreateIndex
CREATE INDEX "founder_applications_businessName_idx" ON "founder_applications"("businessName");

-- CreateIndex
CREATE INDEX "founder_applications_reviewedBy_idx" ON "founder_applications"("reviewedBy");

-- CreateIndex
CREATE INDEX "founder_applications_submittedAt_idx" ON "founder_applications"("submittedAt");

-- AddForeignKey
ALTER TABLE "founder_applications" ADD CONSTRAINT "founder_applications_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
