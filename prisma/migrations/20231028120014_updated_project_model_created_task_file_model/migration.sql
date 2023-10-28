/*
  Warnings:

  - Made the column `employeeId` on table `Subtask` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Subtask" DROP CONSTRAINT "Subtask_employeeId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "priorityColor" TEXT,
ADD COLUMN     "projectProgress" INTEGER;

-- AlterTable
ALTER TABLE "Subtask" ALTER COLUMN "employeeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priorityColor" TEXT,
ADD COLUMN     "statusColor" TEXT;

-- CreateTable
CREATE TABLE "TaskFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "extension" TEXT,
    "employeeId" TEXT,
    "taskId" TEXT,

    CONSTRAINT "TaskFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskFile" ADD CONSTRAINT "TaskFile_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskFile" ADD CONSTRAINT "TaskFile_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
