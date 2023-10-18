import { Priority, PrismaClient, Status, TaskAction } from "@prisma/client";
import asyncHandler from "express-async-handler";
const prisma = new PrismaClient();

// Create a new task
const createTaskFolder = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { orgId: organizationId, folderId } = req.params;
  const { title, description, labels, startDate, endDate, reminderDate } =
    req.body;
  try {
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const newTask = await prisma.task.create({
      data: {
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
        folders: { connect: { id: folderId } },
        organization: { connect: { id: organizationId } },
      },
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
const getAllTasksFolder = asyncHandler(async (req, res) => {
  const { orgId: organizationId, folderId } = req.params;
  try {
    // Check if the folder specified exists
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
        organizationId,
      },
    });

    if (!folder) {
      return res.status(404).json({ message: `Folder ${folderId} not found` });
    }
    const tasks = await prisma.task.findMany({});
    res.status(200).json(tasks);

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
const getTaskByIdFolder = asyncHandler(async (req, res) => {
  const { id, orgId: organizationId, folderId } = req.params;
  try {
    // Check if the folder specified exists
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
    organizationId,
      },
    });

    if (!folder) {
      return res.status(404).json({ message: `Folder ${folderId} not found` });
    }
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        folderId,
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
const updateTaskFolder = asyncHandler(async (req, res) => {
  const { id, folderId, orgId: organizationId } = req.params;
  try {
    // Check if the folder specified exists
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
        organizationId,
      },
    });

    if (!folder) {
      return res.status(404).json({ message: `Folder ${folderId} not found` });
    }
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        folderId,
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
const deleteTaskFolder = asyncHandler(async (req, res) => {
  const { id, folderId, orgId: organizationId } = req.params;
  try {
    // Check if the folder specified exists
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
        organizationId,
      },
    });

    if (!folder) {
      return res.status(404).json({ message: `Folder ${folderId} not found` });
    }
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        folderId,
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
  createTaskFolder,
  deleteTaskFolder,
  getAllTasksFolder,
  getTaskByIdFolder,
  updateTaskFolder,
};
