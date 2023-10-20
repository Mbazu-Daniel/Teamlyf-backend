/*
  Warnings:

  - You are about to drop the column `clientId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `collaboratorsId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_collaboratorsId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_employeeId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "clientId",
DROP COLUMN "collaboratorsId",
DROP COLUMN "employeeId",
ADD COLUMN     "projectCollabaratorsId" TEXT,
ADD COLUMN     "projectCreatorId" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectCollabaratorsId_fkey" FOREIGN KEY ("projectCollabaratorsId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectCreatorId_fkey" FOREIGN KEY ("projectCreatorId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
