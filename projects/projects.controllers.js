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
        projectCreator: { connect: { id: req.employeeId } },
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


// Get all projects
const getAllTasksInProject = asyncHandler(async (req, res) => {
  const { spaceId, workspaceId, projectId  } = req.params;
  try {
    const existingProject = await prisma.space.findFirst({
      where: {
        workspaceId,
        spaceId, 
        id: projectId,
      },
    });
    if (!existingProject) {
      return res.status(404).json({ message: `space  ${projectId} not found` });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
      },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const getSingleTaskInProject = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  try {
    const existingProject = await prisma.project.findFirst({
      where: {
        workspaceId,
        spaceId, 
        id: projectId,
      },
    });
    if (!existingProject) {
      return res.status(404).json({ message: `Project with ID ${projectId} not found` });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: `Task with ID ${taskId} not found in Project ${projectId}` });
    }

    res.status(200).json(task);
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
  getAllTasksInProject,
  getSingleTaskInProject
};
