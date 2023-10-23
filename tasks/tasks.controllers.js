import { TaskPriority, PrismaClient, TaskStatus, TaskAction } from "@prisma/client";
import asyncHandler from "express-async-handler";
const prisma = new PrismaClient();

// TODO: develop CRUD tasks endpoints for inside a space
// TODO: develop CRUD tasks endpoints for inside a space/projects

// TODO: develop CRUD for tasks status and tasks priority


// Get all tasks in the workspace
const getAllTasks = asyncHandler(async (req, res) => {
  const { workspaceId: workspaceId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: workspaceId,
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
const getTaskById = asyncHandler(async (req, res) => {
  const { id, workspaceId: workspaceId } = req.params;
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        workspaceId,
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
const updateTask = asyncHandler(async (req, res) => {
  const { workspaceId: workspaceId } = req.params;
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        workspaceId,
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
const deleteTask = asyncHandler(async (req, res) => {
  const { workspaceId, id  } = req.params;
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        workspaceId,
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

export { deleteTask, getAllTasks, getTaskById, updateTask };
