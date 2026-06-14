-- AlterTable
ALTER TABLE "users"
ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "preferredLocale" VARCHAR(35),
ADD COLUMN "preferredCurrency" CHAR(3);

-- BackfillExistingUsers
UPDATE "users"
SET "passwordHash" = '$argon2id$v=19$m=65536,t=3,p=4$disableddisableddisab$disableddisableddisableddisableddisableddisableddisabled'
WHERE "passwordHash" IS NULL;

ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL;

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" VARCHAR(64),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),
    "lastUsedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_preferredLocale_idx" ON "users"("preferredLocale");
CREATE INDEX "users_preferredCurrency_idx" ON "users"("preferredCurrency");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");
CREATE INDEX "sessions_revokedAt_idx" ON "sessions"("revokedAt");
CREATE INDEX "sessions_deletedAt_idx" ON "sessions"("deletedAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_preferredLocale_fkey" FOREIGN KEY ("preferredLocale") REFERENCES "locales"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_preferredCurrency_fkey" FOREIGN KEY ("preferredCurrency") REFERENCES "currencies"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
