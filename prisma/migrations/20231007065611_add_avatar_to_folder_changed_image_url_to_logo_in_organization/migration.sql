/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `taskPriorityId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `taskStatusId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_taskPriorityId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_taskStatusId_fkey";

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "avater" TEXT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "imageUrl",
ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "taskPriorityId",
DROP COLUMN "taskStatusId";

-- AlterTable
ALTER TABLE "TaskPriority" ADD COLUMN     "taskId" TEXT;

-- AlterTable
ALTER TABLE "TaskStatus" ADD COLUMN     "taskId" TEXT;

-- AddForeignKey
ALTER TABLE "TaskPriority" ADD CONSTRAINT "TaskPriority_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStatus" ADD CONSTRAINT "TaskStatus_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
