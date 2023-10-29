/*
  Warnings:

  - You are about to drop the column `labels` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `EmployeeTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('TEXT', 'AUDIO', 'VIDEO');

-- DropForeignKey
ALTER TABLE "EmployeeTeam" DROP CONSTRAINT "EmployeeTeam_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeTeam" DROP CONSTRAINT "EmployeeTeam_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "labels";

-- DropTable
DROP TABLE "EmployeeTeam";

-- DropTable
DROP TABLE "Team";

-- DropEnum
DROP TYPE "TeamType";

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "type" "DepartmentType" NOT NULL DEFAULT 'TEXT',
    "employeeId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDepartment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "role" "EmployeeRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskLabel" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "taskId" TEXT,

    CONSTRAINT "TaskLabel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_employeeId_workspaceId_name_idx" ON "Department"("employeeId", "workspaceId", "name");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDepartment" ADD CONSTRAINT "EmployeeDepartment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDepartment" ADD CONSTRAINT "EmployeeDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLabel" ADD CONSTRAINT "TaskLabel_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
