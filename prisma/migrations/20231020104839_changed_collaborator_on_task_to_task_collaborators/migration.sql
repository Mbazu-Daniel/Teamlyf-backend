/*
  Warnings:

  - You are about to drop the column `collaboratorsId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_collaboratorsId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "collaboratorsId",
ADD COLUMN     "taskCollaboratorsId" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskCollaboratorsId_fkey" FOREIGN KEY ("taskCollaboratorsId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
