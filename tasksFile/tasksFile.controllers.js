import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create a new task file
const createTaskFile = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { originalname, size, mimetype } = req.file;

  try {
    // Create the task file
    const newTaskFile = await prisma.taskFile.create({
      data: {
        name: originalname,
        file_type: mimetype,
        file_size: size,
        tasks: { connect: { id: taskId } },
        uploadedBy: { connect: { id: req.employeeId } },
      },
    });

    res.status(201).json(newTaskFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

const getAllFiles = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  try {
    // Retrieve all tasks in the specified workspace
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId,
      },
    });

    // Extract all task IDs
    const taskIds = tasks.map((task) => task.id);

    // Retrieve all task files associated with the tasks in the workspace
    const taskFiles = await prisma.taskFile.findMany({
      where: {
        taskId: {
          in: taskIds,
        },
      },
    });

    res.status(200).json(taskFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const getTaskFiles = asyncHandler(async (req, res) => {
  const { taskId, workspaceId } = req.params;

  try {
    // Check if the task specified belongs to the workspace
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: `Task ${taskId} not found in workspace ${workspaceId}`,
      });
    }

    // Retrieve all task files for the specified task
    const taskFiles = await prisma.taskFile.findMany({
      where: {
        taskId,
      },
    });

    res.status(200).json(taskFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update a task file by ID
const updateTaskFile = asyncHandler(async (req, res) => {
  const { taskId, fileId, workspaceId } = req.params;
  const { originalname, size, mimetype } = req.file;

  try {
    // Check if the task file exists
    const file = await prisma.taskFile.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return res
        .status(404)
        .json({ error: `File with id ${fileId} not found` });
    }

    // Update the task file
    const updatedTaskFile = await prisma.taskFile.update({
      where: {
        workspaceId,
        id: fileId,
      },
      data: {
        name: originalname,
        file_type: mimetype,
        file_size: size,
        taskId,
      },
    });

    res.status(200).json(updatedTaskFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Share a task file with collaborators
const shareTaskFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { collaboratorIds } = req.body;

  try {
    const taskFile = await prisma.taskFile.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!taskFile) {
      return res.status(404).json({ message: "Task file not found" });
    }

    // Check if collaboratorIds are valid and exist in the Employee table
    const validCollaboratorIds = await prisma.employee.findMany({
      where: {
        id: {
          in: collaboratorIds,
        },
      },
    });

    if (validCollaboratorIds.length !== collaboratorIds.length) {
      return res.status(400).json({
        message: "One or more collaboratorIds are invalid or do not exist.",
      });
    }

    // Create TaskFileCollaborator entries for each collaborator and connect them to the task file
    for (const collaboratorId of collaboratorIds) {
      await prisma.taskFileCollaborator.create({
        data: {
          fileId,
          employeeId: collaboratorId,
        },
      });
    }

    res.status(200).json({ message: "Task file shared with collaborators" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a task file by ID
const deleteTaskFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  try {
    // Check if the task file exists
    const file = await prisma.taskFile.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return res
        .status(404)
        .json({ error: `File with id ${fileId} not found` });
    }
    // Delete the task file if it exists
    const deleteFile = await prisma.taskFile.delete({
      where: {
        id: fileId,
      },
    });
    if (!deleteFile) {
      res.status(404).json({ error: `File with id ${fileId} not found` });
    }
    res.status(204).json({ message: "Task file deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// Calculate the total file size in a workspace
const calculateTotalFileSizeInWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  try {
    // Get all tasks in the workspace
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId,
      },
      include: {
        taskFiles: true, // Include associated taskFiles
      },
    });

    // Calculate the total file size
    let totalFileSize = 0;
    for (const task of tasks) {
      totalFileSize += task.taskFiles.reduce(
        (total, taskFile) => total + taskFile.file_size,
        0
      );
    }

    const fileSizeMB = totalFileSize / 1024 ** 2;

    res.status(200).json({ totalFileSize, mb_size: fileSizeMB });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error calculating total file size" });
  }
});

export {
  calculateTotalFileSizeInWorkspace,
  createTaskFile,
  deleteTaskFile,
  getAllFiles,
  getTaskFiles,
  shareTaskFile,
  updateTaskFile,
};
