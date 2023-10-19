import { TaskPriority, PrismaClient, TaskStatus, TaskAction } from "@prisma/client";
import asyncHandler from "express-async-handler";
const prisma = new PrismaClient();

// Create a new task
const createTaskSpace = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { workspaceId: workspaceId, spaceId } = req.params;
  const {
    title,
    description,
    labels,
    startDate,
    endDate,
    reminderDate,
    project,
    collaborators,
  } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const taskData = {
      ...req.body,
      title,
      description: description || null,
      labels: labels || null,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      reminderDate: reminderDate || new Date(),
      user: { connect: { id: userId } },
      priority: Priority.NORMAL,
      status: Status.TODO,
      spaces: { connect: { id: spaceId } },
      workspace: { connect: { id: workspaceId } },
    };

    if (collaborators) {
      // If collaborators is provided add them
      taskData.collaborators = { connect: { id: collaborators } };
    }
    if (project) {
      // If projectId is provided, create the task inside the project
      taskData.project = { connect: { id: project } };
    }

    const newTask = await prisma.task.create({
      data: taskData,
    });

    // Log task addition in history using Prisma
    await prisma.taskHistory.create({
      data: {
        tasks: { connect: { id: newTask.id } },
        user: { connect: { id: userId } },
        action: TaskAction.ADDED_TASKS,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all tasks
const getAllTasksSpace = asyncHandler(async (req, res) => {
  const { workspaceId: workspaceId, spaceId } = req.params;
  try {
    // Check if the space specified exists
    const space = await prisma.space.findUnique({
      where: {
        id: spaceId,
        workspaceId,
      },
    });

    if (!space) {
      return res.status(404).json({ message: `space ${spaceId} not found` });
    }
    const tasks = await prisma.task.findMany({ where: { spaceId } });
    res.status(200).json(tasks);

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
const getTaskByIdSpace = asyncHandler(async (req, res) => {
  const { id, workspaceId: workspaceId, spaceId } = req.params;
  try {
    // Check if the space specified exists
    const space = await prisma.space.findUnique({
      where: {
        id: spaceId,
        workspaceId,
      },
    });

    if (!space) {
      return res.status(404).json({ message: `space ${spaceId} not found` });
    }
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        spaceId,
      },
    });
    if (!task) {
      return res.status(404).json({ message: `Task  ${id} not found` });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update task by ID
const updateTaskSpace = asyncHandler(async (req, res) => {
  const { id, spaceId, workspaceId: workspaceId } = req.params;
  try {
    // Check if the space specified exists
    const space = await prisma.space.findUnique({
      where: {
        id: spaceId,
        workspaceId,
      },
    });

    if (!space) {
      return res.status(404).json({ message: `space ${spaceId} not found` });
    }
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        spaceId,
      },
    });
    if (!task) {
      return res.status(404).json({ message: `Task  ${id} not found` });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: id,
      },
      data: req.body,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task by ID
const deleteTaskSpace = asyncHandler(async (req, res) => {
  const { id, spaceId, workspaceId: workspaceId } = req.params;
  try {
    // Check if the space specified exists
    const space = await prisma.space.findUnique({
      where: {
        id: spaceId,
        workspaceId,
      },
    });

    if (!space) {
      return res.status(404).json({ message: `space ${spaceId} not found` });
    }
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        spaceId,
      },
    });
    if (!task) {
      return res.status(404).json({ message: `Task  ${id} not found` });
    }
    // Delete the task if it exists
    await prisma.task.delete({
      where: {
        id: id,
      },
    });

    res.status(204).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  createTaskSpace,
  deleteTaskSpace,
  getAllTasksSpace,
  getTaskByIdSpace,
  updateTaskSpace,
};
