import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { deleteFile } from "../../utils/services/awsS3bucket.js";
import deleteFolderRecursive from "../../utils/helpers/deleteChildFolders.js";
const prisma = new PrismaClient();

// Get all trashbins in a workspace
const getAllTrashbins = asyncHandler(async (req, res) => {
  try {
    const trashbins = await prisma.trashBin.findMany({});

    res.status(200).json(trashbins);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

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

    // Check if folderIds are provided
    if (!folderIds || folderIds.length === 0) {
      const existingFiles = await prisma.file.findMany({
        where: {
          id: {
            in: fileIds,
          },
        },
      });

      // If any file in the trash bin doesn't exist, return an error
      if (existingFiles.length !== fileIds.length) {
        return res.status(404).json({
          error: "files already deleted from database",
        });
      }

      // If no folderIds are provided, proceed with deleting only files
      for (const fileId of fileIds) {
        const file = await prisma.file.findUnique({
          where: { id: fileId },
          select: { fileIdentifier: true },
        });

        if (file) {
          await deleteFile(file.fileIdentifier);
        }
      }

      // Delete mappings for selected files
      await prisma.fileFolderMapping.deleteMany({
        where: {
          fileId: {
            in: fileIds,
          },
        },
      });
      // Delete files from database
      await prisma.file.deleteMany({
        where: {
          id: {
            in: fileIds,
          },
        },
      });
      return res.status(200).json({
        msg: "Selected files deleted successfully",
      });
    }

    // Check if all folders and files in the trash bin exist
    const existingFolders = await prisma.folder.findMany({
      where: {
        id: {
          in: folderIds,
        },
      },
    });

    const existingFiles = await prisma.file.findMany({
      where: {
        id: {
          in: fileIds,
        },
      },
    });

    // If any folder or file in the trash bin doesn't exist, return an error
    if (
      existingFolders.length !== folderIds.length ||
      existingFiles.length !== fileIds.length
    ) {
      return res
        .status(404)
        .json({ error: "Some folders or files in the trash bin do not exist" });
    }

    // Delete selected folders
    for (const folderId of folderIds) {
      await deleteFolderRecursive(folderId);
    }

    // Delete selected folders
    await prisma.folder.deleteMany({
      where: {
        id: {
          in: folderIds,
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
    // Delete selected files using FileFolderMapping
    await prisma.fileFolderMapping.deleteMany({
      where: {
        fileId: {
          in: fileIds,
        },
      },
    });

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
    const employeeId = req.employeeId;

    // Find all trash bin entries
    const trashBinEntries = await prisma.trashBin.findMany({
      where: {
        employeeId,
      },
    });

    // If the trash bin is already empty, return an error message
    if (trashBinEntries.length === 0) {
      return res.status(404).json({ error: "The trash bin is already empty" });
    }

    // Separate folder IDs  from the trash bin entries
    const folderIds = trashBinEntries
      .filter((entry) => entry.folderId)
      .map((entry) => entry.folderId);

    // Separate file IDs from the trash bin entries
    const fileIds = trashBinEntries
      .filter((entry) => entry.fileId)
      .map((entry) => entry.fileId);

    // Check if all files in the trash bin exist
    const allFiles = await prisma.file.findMany({
      where: {
        id: {
          in: fileIds,
        },
      },
    });

    // If any file in the trash bin doesn't exist, return an error
    if (allFiles.length !== fileIds.length) {
      return res.status(404).json({
        error: "Some files in the trash bin do not exist",
      });
    }

    // Check if folderIds are provided
    if (!folderIds || folderIds.length === 0) {
      // If no folderIds are provided, proceed with deleting only files
      for (const fileId of fileIds) {
        const file = await prisma.file.findUnique({
          where: { id: fileId },
          select: { fileIdentifier: true },
        });

        if (file) {
          await deleteFile(file.fileIdentifier);
        }
      }

      // Delete mappings for selected files
      await prisma.fileFolderMapping.deleteMany({
        where: {
          fileId: {
            in: fileIds,
          },
        },
      });

      // Delete files from database
      await prisma.file.deleteMany({
        where: {
          id: {
            in: fileIds,
          },
        },
      });

      // Delete all trash bin entries
      await prisma.trashBin.deleteMany({
        where: {
          employeeId,
        },
      });

      return res.status(200).json({
        msg: "Selected files deleted successfully",
      });
    }

    // Delete selected folders and associated files
    for (const folderId of folderIds) {
      await deleteFolderRecursive(folderId);
    }

    // Delete selected folders
    await prisma.folder.deleteMany({
      where: {
        id: {
          in: folderIds,
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

    // Delete mappings for selected files
    await prisma.fileFolderMapping.deleteMany({
      where: {
        fileId: {
          in: fileIds,
        },
      },
    });

    // Delete all trash bin entries
    await prisma.trashBin.deleteMany({
      where: {
        employeeId,
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
  getAllTrashbins,
};
