import { PrismaClient } from "@prisma/client";
import { deleteFile } from "../services/awsS3bucket.js";
const prisma = new PrismaClient();

const deleteFolderRecursive = async (folderId) => {
  // Find all child folders of the current folder
  const childFolders = await prisma.folder.findMany({
    where: {
      parentFolderId: folderId,
    },
  });

  // Delete all child folders recursively
  for (const childFolder of childFolders) {
    await deleteFolderRecursive(childFolder.id);
  }

  // Delete files associated with the folder using FileFolderMapping
  const folderFiles = await prisma.fileFolderMapping.findMany({
    where: {
      folderId,
    },
    select: {
      fileId: true,
    },
  });

  // Extract file IDs
  const fileIds = folderFiles.map((file) => file.fileId);

  // Delete files from AWS S3
  for (const fileId of fileIds) {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { fileIdentifier: true },
    });

    if (file) {
      await deleteFile(file.fileIdentifier);
    }
  }

  // Delete mappings for files associated with the folder
  await prisma.fileFolderMapping.deleteMany({
    where: {
      folderId,
    },
  });

  // Delete child folders
  for (const childFolder of childFolders) {
    await deleteFolderRecursive(childFolder.id);
  }

  // Delete the current folder
  await prisma.folder.delete({
    where: {
      id: folderId,
    },
  });
};

export default deleteFolderRecursive;
