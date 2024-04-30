import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import {
 deleteFile
} from "../../utils/services/awsS3bucket.js";
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

const restoreFoldersAndFilesFromTrash = asyncHandler(async (req, res) => {
  try {
    const { trashBinIds } = req.body;

    // Find trash bin entries with the provided IDs
    const trashBinEntries = await prisma.trashBin.findMany({
      where: {
        id: {
          in: trashBinIds,
        },
      },
    });

    // Separate folder IDs and file IDs from the trash bin entries
    const folderIds = trashBinEntries
      .filter((entry) => entry.folderId)
      .map((entry) => entry.folderId);
    const fileIds = trashBinEntries
      .filter((entry) => entry.fileId)
      .map((entry) => entry.fileId);

    // Check if any of the specified trash bin entries are already restored
    const alreadyRestoredFolders = await prisma.folder.findMany({
      where: {
        id: {
          in: folderIds,
        },
        isTrashed: false,
      },
    });

    const alreadyRestoredFiles = await prisma.file.findMany({
      where: {
        id: {
          in: fileIds,
        },
        isTrashed: false,
      },
    });

    if (alreadyRestoredFolders.length > 0 || alreadyRestoredFiles.length > 0) {
      return res
        .status(400)
        .json({ error: "Some folders or files are already restored" });
    }

    // Update folders to mark them as not trashed
    await prisma.folder.updateMany({
      where: {
        id: {
          in: folderIds,
        },
      },
      data: {
        isTrashed: false,
      },
    });

    // Update files to mark them as not trashed
    await prisma.file.updateMany({
      where: {
        id: {
          in: fileIds,
        },
      },
      data: {
        isTrashed: false,
      },
    });

    // Delete trash bin entries
    await prisma.trashBin.deleteMany({
      where: {
        id: {
          in: trashBinIds,
        },
      },
    });

    res.status(200).json({
      msg: "Folders and files restored from trash successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const deleteSelectedFoldersAndFiles = asyncHandler(async (req, res) => {
  try {
    const { folderIds, fileIds } = req.body;

    // Delete selected folders
    await prisma.folder.deleteMany({
      where: {
        id: {
          in: folderIds,
        },
      },
    });

    // Delete selected files using FileFolderMapping
    await prisma.fileFolderMapping.deleteMany({
      where: {
        fileId: {
          in: fileIds,
        },
      },
    });

      // Delete files from AWS S3
    for (const fileId of fileIds) {
      // Get the file details to retrieve the file name
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        select: { fileIdentifier: true },
      });

      if (file) {
        // Delete the file from AWS S3
        await deleteFile(file.fileIdentifier);
      }
    }

    res.status(200).json({
      msg: "Selected folders and files deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const emptyTrashBin = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const employeeId = req.employeeId;
    // Find all trash bin entries
    const trashBinEntries = await prisma.trashBin.findMany({
      where: {
        workspaceId,
        employeeId,
      },
    });

    // Separate folder IDs and file IDs from the trash bin entries
    const folderIds = trashBinEntries
      .filter((entry) => entry.folderId)
      .map((entry) => entry.folderId);
    const fileIds = trashBinEntries
      .filter((entry) => entry.fileId)
      .map((entry) => entry.fileId);

    // // Check if all folders and files in the trash bin exist
    // const existingFolders = await prisma.folder.findMany({
    //   where: {
    //     id: {
    //       in: folderIds,
    //     },
    //   },
    // });

    // const existingFiles = await prisma.file.findMany({
    //   where: {
    //     id: {
    //       in: fileIds,
    //     },
    //   },
    // });

    // // If any folder or file in the trash bin doesn't exist, return an error
    // if (
    //   existingFolders.length !== folderIds.length ||
    //   existingFiles.length !== fileIds.length
    // ) {
    //   return res
    //     .status(404)
    //     .json({ error: "Some folders or files in the trash bin do not exist" });
    // }

    // Delete all trash bin entries
    await prisma.trashBin.deleteMany({
      where: {
        workspaceId,
        employeeId,
      },
    });

    // Delete associated file-folder mappings
    await prisma.fileFolderMapping.deleteMany({
      where: {
        OR: [
          {
            fileId: {
              in: fileIds,
            },
          },
          {
            folderId: {
              in: folderIds,
            },
          },
        ],
      },
    });


// Delete the files from AWS S3

    // Delete files from AWS S3
    for (const fileId of fileIds) {
      // Get the file details to retrieve the file name
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        select: { fileIdentifier: true },
      });

      if (file) {
        await deleteFile(file.fileIdentifier); 
      }
    }

    // Delete all associated files and folders
    await prisma.folder.deleteMany({
      where: {
        id: {
          in: folderIds,
        },
      },
    });

    await prisma.file.deleteMany({
      where: {
        id: {
          in: fileIds,
        },
      },
    });

    res.status(200).json({
      msg: "Trash bin emptied successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  moveFoldersAndFilesToTrash,
  restoreFoldersAndFilesFromTrash,
  deleteSelectedFoldersAndFiles,
  emptyTrashBin,
};
