import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TODO: create a select to show all folders created, shared folders/files or shared folders/files
// TODO: create a function that can handle creation of folder or different types of file
// TODO: create a function that can handle moving of folder or file to trash
// TODO: create a function that can handle restoring of folder or file from  trash
// TODO: uploading folders to cloud storage
// TODO: create folder with workspace id-name inside s3 bucket, if workspace already exists then no need to create new folder

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

    // If parentFolderId is provided, connect to the parent folder to create a parent child hierarchy
    if (parentFolderId) {
      folderData.parentFolder = { connect: { id: parentFolderId } };
    }

    const newFolder = await prisma.folder.create({
      data: folderData,
    });

    res.status(201).json(newFolder);
  } catch (error) {
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
        isTrashed: false,
      },
    });

    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Get all child folders of a parent folder
const getSingleFolder = asyncHandler(async (req, res) => {
  try {
    const { folderId, workspaceId } = req.params;
    7;

    // check if folder exists
    const existingFolder = await prisma.folder.findFirst({
      where: {
        workspaceId,
        isTrashed: false,
      },
    });

    if (!existingFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    const folders = await prisma.folder.findFirst({
      where: {
        id: folderId,
      },
      include: {
        childFolders: true,
      },
    });

    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Update a folder by ID
const updateFolder = asyncHandler(async (req, res) => {
  try {
    const { workspaceId, folderId } = req.params;
    const { name, description } = req.body;

    // check if folder exists
    const existingFolder = await prisma.folder.findFirst({
      where: {
        workspaceId,
        isTrashed: false,
      },
    });

    if (!existingFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const updatedFolder = await prisma.folder.update({
      where: {
        id: folderId,
        workspaceId,
      },
      data: {
        name: name || null,
        description: description || null,
      },
    });

    res.status(200).json(updatedFolder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { createFolder, getAllFolders, getSingleFolder, updateFolder };
