import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TODO: empty trashbin: this will delete all folders and files in the trashbin
// TODO: delete some files and folders in the trashbin

//  move folders and files to trash bin
const moveFoldersAndFilesToTrash = asyncHandler(async (req, res) => {
  try {
    const { folderIds, fileIds, reason } = req.body;
    const employeeId = req.employeeId;

    // Check if folders are already moved to trash
    const existingTrashedFolders = await prisma.folder.findMany({
      where: {
        id: {
          in: folderIds,
        },
        isTrashed: true,
      },
    });

    if (existingTrashedFolders.length > 0) {
      return res
        .status(400)
        .json({ error: "Some folders are already in the trash bin" });
    }

    // Check if files are already moved to trash
    const existingTrashedFiles = await prisma.file.findMany({
      where: {
        id: {
          in: fileIds,
        },
        isTrashed: true,
      },
    });

    if (existingTrashedFiles.length > 0) {
      return res
        .status(400)
        .json({ error: "Some files are already in the trash bin" });
    }

    // Update folders to mark them as trashed
    await prisma.folder.updateMany({
      where: {
        id: {
          in: folderIds,
        },
      },
      data: {
        isTrashed: true,
      },
    });

    // Update files to mark them as trashed
    await prisma.file.updateMany({
      where: {
        id: {
          in: fileIds,
        },
      },
      data: {
        isTrashed: true,
      },
    });

    // Create trash bin entries for folders
    await prisma.trashBin.createMany({
      data: folderIds.map((folderId) => ({
        folderId,
        employeeId,
        reason: reason || null,
      })),
    });

    // Create trash bin entries for files
    await prisma.trashBin.createMany({
      data: fileIds.map((fileId) => ({
        fileId,
        employeeId,
        reason: reason || null,
      })),
    });

    res.status(200).json({
      msg: "Folders and files moved to trash successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});





export { moveFoldersAndFilesToTrash};
