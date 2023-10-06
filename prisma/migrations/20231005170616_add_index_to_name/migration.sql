-- DropIndex
DROP INDEX "Organization_userId_idx";

-- CreateIndex
CREATE INDEX "Organization_userId_name_idx" ON "Organization"("userId", "name");
