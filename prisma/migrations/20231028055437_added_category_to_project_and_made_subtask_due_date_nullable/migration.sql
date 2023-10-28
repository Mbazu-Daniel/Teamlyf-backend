/*
  Warnings:

  - You are about to drop the column `endDate` on the `Subtask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "Subtask" DROP COLUMN "endDate",
ADD COLUMN     "dueDate" TIMESTAMP(3);
