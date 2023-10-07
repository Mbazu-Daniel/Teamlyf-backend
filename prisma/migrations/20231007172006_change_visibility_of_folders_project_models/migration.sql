/*
  Warnings:

  - You are about to drop the column `avater` on the `Folder` table. All the data in the column will be lost.
  - Made the column `organizationId` on table `Folder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Folder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `folderId` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "avater",
ADD COLUMN     "avatar" TEXT,
ALTER COLUMN "organizationId" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "folderId" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
