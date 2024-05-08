// this controller handles other file manager functionalities

import asyncHandler from "express-async-handler";
import { PrismaClient, SharedLinkVisibility } from "@prisma/client";
import {
  generateUniqueId,
  generateHashedPassword,
} from "../../utils/helpers/index.js";
import { SALT } from "../../utils/config/env.js";

const prisma = new PrismaClient();

// TODO: controller to return both  starred folders and files
// TODO: controller to return both folders and files

// Get all folders and files in a workspace
const getAllUsersFoldersAndFiles = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const employeeId = req.employeeId;

    const folders = await prisma.folder.findMany({
      where: {
        workspaceId,
        employeeId,
        parentFolderId: null,
        isTrashed: false,
      },
    });

    const files = await prisma.file.findMany({
      where: {
        workspaceId,
        employeeId,
        isTrashed: false,
      },
    });

    res.status(200).json({ folders: folders, files: files });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

const getStarredFoldersAndFolders = asyncHandler(async (req, res) => {
  try {
    // Retrieve all folders  that are marked as starred
    const starredFolders = await prisma.folder.findMany({
      where: { isStarred: true },
      include: { mappings: true },
    });

    // Retrieve all files  that are marked as starred
    const starredFiles = await prisma.file.findMany({
      where: { isStarred: true },
      include: { mappings: true },
    });

    res.status(200).json({ folders: starredFolders, files: starredFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const markAsStarred = asyncHandler(async (req, res) => {
  try {
    const { itemId, itemType } = req.body;

    if (itemType === "folder") {
      // Mark folder as starred
      await prisma.folder.update({
        where: { id: itemId },
        data: { isStarred: true },
      });

      res.status(200).json({ msg: "Folder marked as starred successfully" });
    } else if (itemType === "file") {
      // Mark file as starred
      await prisma.file.update({
        where: { id: itemId },
        data: { isStarred: true },
      });

      res.status(200).json({ msg: "File marked as starred successfully" });
    } else {
      res.status(400).json({ error: "Invalid item type" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  markAsStarred,
  getAllUsersFoldersAndFiles,
  getStarredFoldersAndFolders,

};


