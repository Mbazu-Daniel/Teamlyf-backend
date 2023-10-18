import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create a new folder
const createFolder = asyncHandler(async (req, res) => {
  const { orgId: organizationId } = req.params;
  const { id: userId } = req.user;
  const { title, avatar } = req.body;
  try {
    console.log("organizationId", organizationId);
    // check if the title exist in the organization
    const existingFolder = await prisma.folder.findFirst({
      where: { title, organizationId },
    });

    if (existingFolder) {
      return res.status(400).json({ error: `Folder ${title} already exists` });
    }
    const folder = await prisma.folder.create({
      data: {
        title,
        avatar,
        userId,
        organizationId,
      },
    });

    res.status(201).json(folder);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all folders
const getAllFolders = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  try {
    const folders = await prisma.folder.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        projects: {
          select: {
            id: true,
          },
        },
      },
    });

    res.status(200).json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get folder by ID
const getFolderById = asyncHandler(async (req, res) => {
  const { id, organizationId } = req.params;
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id,
        organizationId,
      },
      include: {
        projects: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!folder) {
      return res.status(404).json({ message: `Folder  ${id} not found` });
    }
    res.status(200).json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update folder by ID
const updateFolder = asyncHandler(async (req, res) => {
  const { organizationId, id } = req.params;
  try {
    const existingFolder = await prisma.folder.findUnique({
      where: {
        id,
        organizationId,
      },
    });
    if (!existingFolder) {
      return res.status(404).json({ message: `Folder  ${id} not found` });
    }
    const folder = await prisma.folder.update({
      where: {
        id,
        organizationId,
      },
      data: req.body,
    });
    if (!folder) {
      return res.status(404).json({ message: `Folder  ${id} not found` });
    }
    res.status(200).json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete folder by ID
const deleteFolder = asyncHandler(async (req, res) => {
  const { id, organizationId } = req.params;
  try {
    const existingFolder = await prisma.folder.findUnique({
      where: {
        id,
        organizationId,
      },
    });
    if (!existingFolder) {
      return res.status(404).json({ message: `Folder  ${id} not found` });
    }

    await prisma.folder.delete({
      where: {
        id,
        organizationId,
      },
    });

    res.status(204).json(`Folder ${id} deleted `);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: error.message });
  }
});

export {
  createFolder,
  deleteFolder,
  getAllFolders,
  getFolderById,
  updateFolder,
};
