ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "isRecurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "recurringInterval" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "recurringParentId" TEXT;
CREATE INDEX IF NOT EXISTS "Transaction_userId_isRecurring_idx" ON "Transaction"("userId", "isRecurring");
