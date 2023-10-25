import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create a new project
const createProject = asyncHandler(async (req, res) => {
  const { spaceId, workspaceId } = req.params;
  const {
    name,
    description,
    status,
    priority,
    startDate,
    dueDate,
    collaboratorIds,
  } = req.body;
  try {
    const existingSpace = await prisma.space.findFirst({
      where: {
        id: spaceId,
        workspaceId,
      },
    });
    if (!existingSpace) {
      return res.status(404).json({ message: `space  ${spaceId} not found` });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        status: status || TaskStatus.TO_DO,
        priority: priority || TaskPriority.NORMAL,
        startDate: startDate || new Date(),
        dueDate: dueDate || null,

        spaces: { connect: { id: spaceId } },
        projectCreator: { connect: { id: req.employeeId } },
      },

      include: {
        projectCollaborators: {
          select: {
            employee: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Create ProjectCollaborator entries for each collaborator and connect them to the project
    if (collaboratorIds && collaboratorIds.length > 0) {
      for (const collaboratorId of collaboratorIds) {
        await prisma.projectCollaborator.create({
          data: {
            projectId: project.id,
            employeeId: collaboratorId,
          },
        });
      }
    }

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all projects
const getAllProjects = asyncHandler(async (req, res) => {
  const { spaceId, workspaceId } = req.params;
  const { priorities, statuses } = req.query;
  try {
    const existingSpace = await prisma.space.findFirst({
      where: {
        id: spaceId,
        workspaceId,
      },
    });
    if (!existingSpace) {
      return res.status(404).json({ message: `space  ${spaceId} not found` });
    }

    const projects = await prisma.project.findMany({
      where: {
        spaceId,
        priority: priorities ? { in: priorities.split(",") } : undefined,
        status: statuses ? { in: statuses.split(",") } : undefined,
      },

      include: {
        projectCollaborators: {
          select: {
            employee: {
              select: {
                email: true,
              },
            },
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

      include: {
        projectCollaborators: {
          select: {
            employee: {
              select: {
                email: true,
              },
            },
          },
        },
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
  const { spaceId, workspaceId, projectId } = req.params;
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
      return res
        .status(404)
        .json({ message: `Project with ID ${projectId} not found` });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: `Task with ID ${taskId} not found in Project ${projectId}`,
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const addCollaboratorsToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { employeeIds } = req.body;

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project ${projectId} not found` });
    }

    // Check if employeeIds are valid and exist in the Employee table
    const validEmployeeIds = await prisma.employee.findMany({
      where: {
        id: {
          in: employeeIds,
        },
      },
    });

    if (validEmployeeIds.length !== employeeIds.length) {
      return res.status(400).json({
        message: "One or more employeeIds are invalid or do not exist.",
      });
    }

    // Check if collaborators already exist for the specified project and employeeIds
    const existingCollaborators = await prisma.projectCollaborator.findMany({
      where: {
        projectId,
        employeeId: {
          in: employeeIds,
        },
      },
    });

    if (existingCollaborators.length > 0) {
      return res.status(400).json({
        message: "One or more collaborators already exist for this project.",
      });
    }

    // Create ProjectCollaborator entries for each employee and connect them to the project
    for (const employeeId of employeeIds) {
      await prisma.projectCollaborator.create({
        data: {
          projectId,
          employeeId,
        },
      });
    }

    res.status(200).json({ message: "Collaborators added to the project" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const removeCollaboratorsFromProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { employeeIds } = req.body;

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project ${projectId} not found` });
    }

    // Remove ProjectCollaborator entries for each specified employee
    for (const employeeId of employeeIds) {
      const removedCollaborator = await prisma.projectCollaborator.delete({
        where: {
          projectId_employeeId: {
            projectId: projectId,
            employeeId: employeeId,
          },
        },
      });

      if (!removedCollaborator) {
        return res.status(404).json({
          message: `Collaborator not found for employee ${employeeId}`,
        });
      }
    }

    res.status(200).json({ message: "Collaborators removed from the project" });
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
  getSingleTaskInProject,
  addCollaboratorsToProject,
  removeCollaboratorsFromProject,
};
