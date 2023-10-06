-- AlterEnum
ALTER TYPE "EmployeeRole" ADD VALUE 'GUEST';

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "alias" TEXT;
