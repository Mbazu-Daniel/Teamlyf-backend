import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TODO: create a select to show all

// Create a new folder
const createFolder = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const employeeId = req.employeeId;
    const { parentFolderId, name, description } = req.body;

    // data for creating new folder
    const folderData = {
      name,
      description: description || null,
      workspace: { connect: { id: workspaceId } },
      employee: { connect: { id: employeeId } },
    };

    // If parentFolderId is provided, connect to the parent folder
    if (parentFolderId) {
      folderData.parentFolder = { connect: { id: parentFolderId } };
    }

    const newFolder = await prisma.folder.create({
      data: folderData,
    });

    res.status(201).json(newFolder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

// Get all folders in a workspace
const getAllFolders = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const folders = await prisma.folder.findMany({
      where: {
        workspaceId,
        parentFolderId: null, // Exclude child folders
      },
    });

    res.status(200).json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

// Get all child folders of a parent folder
const getSingleFolder = asyncHandler(async (req, res) => {
  try {
    const { folderId } = req.params;

    const folders = await prisma.folder.findFirst({
      where: {
        OR: [
          { id: folderId }, // Checks if folderId matches the id directly
          { parentFolderId: folderId }, // Checks if folderId matches the parentFolderId
        ],
      },
      include: {
        childFolders: true,
      },
    });

    res.status(200).json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

// Update a folder by ID
const updateFolder = asyncHandler(async (req, res) => {
  try {
    const { workspaceId, folderId } = req.params;
    const { name, description } = req.body;

    const updatedFolder = await prisma.folder.update({
      where: {
        workspaceId,
        OR: [
          { id: folderId }, // Checks if folderId matches the id directly
          { parentFolderId: folderId }, // Checks if folderId matches the parentFolderId
        ],
      },
      data: {
        name: name || null,
        description: description || null,
      },
    });

    res.status(200).json(updatedFolder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a folder by ID
const deleteFolder = asyncHandler(async (req, res) => {
  try {
    const { folderId } = req.params;

    let deletedFolder;

    // Check if folderId matches the id directly
    deletedFolder = await prisma.folder.delete({
      where: { id: folderId },
    });

    // If no folder was deleted based on id, check if folderId matches the parentFolderId
    if (!deletedFolder) {
      deletedFolder = await prisma.folder.deleteMany({
        where: { parentFolderId: folderId },
      });
    }

    if (!deletedFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    res
      .status(204)
      .json({ msg: `Folder ${deletedFolder.name} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createFolder,
  getAllFolders,
  getSingleFolder,
  updateFolder,
  deleteFolder,
};
