import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new project
const createProject = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const { id: userId } = req.user;
  const { name, description } = req.body;
  try {
    console.log("folderId", folderId);
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
      },
    });
    if (!existingFolder) {
      return res.status(404).json({ message: `Folder  ${id} not found` });
    }
    // check if the nsmr exist in the folder
    const existingProject = await prisma.project.findFirst({
      where: { name, folderId },
    });

    if (existingProject) {
      return res.status(400).json({ error: `Project ${name} already exists` });
    }
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        userId,
        folderId,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all projects
const getAllProjects = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  try {
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
      },
    });
    if (!existingFolder) {
      return res.status(404).json({ message: `Folder  ${id} not found` });
    }

    const projects = await prisma.project.findMany({
      where: {
        folderId,
      },
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
const getProjectById = asyncHandler(async (req, res) => {
  const { id, folderId } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: {
        id,
        folderId,
      },
    });
    if (!project) {
      return res.status(404).json({ message: `Project  ${id} not found` });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update project by ID
const updateProject = asyncHandler(async (req, res) => {
  const { folderId, id } = req.params;
  try {
    const existingProject = await prisma.project.findUnique({
      where: {
        id,
        folderId,
      },
    });
    if (!existingProject) {
      return res.status(404).json({ message: `Project  ${id} not found` });
    }
    const project = await prisma.project.update({
      where: {
        id,
        folderId,
      },
      data: req.body,
    });
    if (!project) {
      return res.status(404).json({ message: `Project  ${id} not found` });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete project by ID
const deleteProject = asyncHandler(async (req, res) => {
  const { id, folderId } = req.params;
  try {
    const existingProject = await prisma.project.findUnique({
      where: {
        id,
        folderId,
      },
    });
    if (!existingProject) {
      return res.status(404).json({ message: `Project  ${id} not found` });
    }

    await prisma.project.delete({
      where: {
        id,
        folderId,
      },
    });

    res.status(204).json(`Project ${id} deleted `);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: error.message });
  }
});

export {
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject,
  updateProject,
};
