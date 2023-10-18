/*
  Warnings:

  - You are about to drop the column `taskPriorityId` on the `SubTask` table. All the data in the column will be lost.
  - You are about to drop the column `taskStatusId` on the `SubTask` table. All the data in the column will be lost.
  - You are about to drop the column `taskPriorityId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `taskStatusId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `TaskPriority` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubTask" DROP CONSTRAINT "SubTask_taskPriorityId_fkey";

-- DropForeignKey
ALTER TABLE "SubTask" DROP CONSTRAINT "SubTask_taskStatusId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_taskPriorityId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_taskStatusId_fkey";

-- AlterTable
ALTER TABLE "SubTask" DROP COLUMN "taskPriorityId",
DROP COLUMN "taskStatusId";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "taskPriorityId",
DROP COLUMN "taskStatusId";

-- DropTable
DROP TABLE "TaskPriority";

-- DropTable
DROP TABLE "TaskStatus";
