-- DropIndex
DROP INDEX "Employee_email_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employeeId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
