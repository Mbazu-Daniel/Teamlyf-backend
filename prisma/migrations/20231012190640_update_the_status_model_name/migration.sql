/*
  Warnings:

  - You are about to drop the column `taskpriority` on the `SubTask` table. All the data in the column will be lost.
  - You are about to drop the column `taskpiority` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `taskstatus` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SubTask" DROP COLUMN "taskpriority",
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "taskpiority",
DROP COLUMN "taskstatus",
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'TODO',
ALTER COLUMN "endDate" DROP NOT NULL;
