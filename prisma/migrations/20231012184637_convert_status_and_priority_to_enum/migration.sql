/*
  Warnings:

  - You are about to drop the column `taskId` on the `TaskPriority` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `TaskStatus` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "TaskPriority" DROP CONSTRAINT "TaskPriority_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskStatus" DROP CONSTRAINT "TaskStatus_taskId_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "taskPriorityId" TEXT,
ADD COLUMN     "taskStatusId" TEXT,
ADD COLUMN     "taskpiority" "Priority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "taskstatus" "Status" NOT NULL DEFAULT 'TODO',
ALTER COLUMN "reminderDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TaskPriority" DROP COLUMN "taskId",
ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "TaskStatus" DROP COLUMN "taskId",
ADD COLUMN     "color" TEXT;

-- CreateTable
CREATE TABLE "SubTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "taskId" TEXT,
    "status" "Status" NOT NULL DEFAULT 'TODO',
    "taskpriority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "taskStatusId" TEXT,
    "taskPriorityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskPriorityId_fkey" FOREIGN KEY ("taskPriorityId") REFERENCES "TaskPriority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskStatusId_fkey" FOREIGN KEY ("taskStatusId") REFERENCES "TaskStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTask" ADD CONSTRAINT "SubTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTask" ADD CONSTRAINT "SubTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTask" ADD CONSTRAINT "SubTask_taskStatusId_fkey" FOREIGN KEY ("taskStatusId") REFERENCES "TaskStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTask" ADD CONSTRAINT "SubTask_taskPriorityId_fkey" FOREIGN KEY ("taskPriorityId") REFERENCES "TaskPriority"("id") ON DELETE SET NULL ON UPDATE CASCADE;
