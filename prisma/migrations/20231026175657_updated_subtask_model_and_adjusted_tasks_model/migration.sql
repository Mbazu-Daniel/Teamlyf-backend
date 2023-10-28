/*
  Warnings:

  - You are about to drop the column `status` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `SubTask` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TaskAction" ADD VALUE 'ADDED_SUBTASKS';

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "SubTask" DROP COLUMN "priority";
