/*
  Warnings:

  - Made the column `organizationId` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_organizationId_fkey";

-- DropIndex
DROP INDEX "Team_userId_organizationId_idx";

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Team_userId_organizationId_name_idx" ON "Team"("userId", "organizationId", "name");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
