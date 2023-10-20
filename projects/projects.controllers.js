import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create a new project
const createProject = asyncHandler(async (req, res) => {
  const { spaceId, workspaceId } = req.params;
  const { name, description } = req.body;
  try {
    const existingSpace = await prisma.space.findFirst({
      where: {
        id: spaceId,
      },
    });
    if (!existingSpace) {
      return res.status(404).json({ message: `space  ${id} not found` });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        createdBy: { connect: { id: req.employeeId } },
        spaces: { connect: { id: spaceId } },
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
  const { spaceId } = req.params;
  try {
    const existingSpace = await prisma.space.findFirst({
      where: {
        id: spaceId,
      },
    });
    if (!existingSpace) {
      return res.status(404).json({ message: `space  ${spaceId} not found` });
    }

    const projects = await prisma.project.findMany({
      where: {
        spaceId,
      },
      include: {
        tasks: {
          select: {
            id: true,
          },
        },
        
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
  const { id, spaceId } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: {
        id,
        spaceId,
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
  const { spaceId, id } = req.params;
  try {
    const existingProject = await prisma.project.findUnique({
      where: {
        id,
        spaceId,
      },
    });
    if (!existingProject) {
      return res.status(404).json({ message: `Project  ${id} not found` });
    }
    const project = await prisma.project.update({
      where: {
        id,
        spaceId,
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
  const { id, spaceId } = req.params;
  try {
    const existingProject = await prisma.project.findUnique({
      where: {
        id,
        spaceId,
      },
    });
    if (!existingProject) {
      return res.status(404).json({ message: `Project  ${id} not found` });
    }

    await prisma.project.delete({
      where: {
        id,
        spaceId,
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
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
};
