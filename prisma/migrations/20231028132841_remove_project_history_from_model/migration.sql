/*
  Warnings:

  - You are about to drop the `ProjectHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectHistory" DROP CONSTRAINT "ProjectHistory_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectHistory" DROP CONSTRAINT "ProjectHistory_projectId_fkey";

-- DropTable
DROP TABLE "ProjectHistory";
