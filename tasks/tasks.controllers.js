import { Priority, PrismaClient, Status, TaskAction } from "@prisma/client";
import asyncHandler from "express-async-handler";
const prisma = new PrismaClient();

// TODO: develop CRUD tasks endpoints for inside a folder
// TODO: develop CRUD tasks endpoints for inside a folder/projects
// you can use if statement for the above statement

// TODO: develop CRUD for tasks status and tasks priority

// Create a new task
const createTask = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { folderId, orgId } = req.params;
  console.log("org", orgId);
  console.log("folder", folderId);
  const {
    title,
    description,
    labels,
    startDate,
    endDate,
    reminderDate,
    projectId,
  } = req.body;
  try {
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        labels: labels || null,
        startDate: startDate || new Date(),
        endDate: endDate || new Date(),
        reminderDate: reminderDate || new Date(),
        user: { connect: { id: userId } },
        collaborators: null || { connect: collaborators.map((id) => ({ id })) },
        priority: Priority.NORMAL,
        status: Status.TODO,
        folders: { connect: { id: folderId } },
        project: { connect: { id: projectId } },
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
const getAllTasks = asyncHandler(async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({});
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: `Task  ${id} not found` });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task by ID
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!task) {
      return res.status(404).json({ message: `Task  ${id} not found` });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task by ID
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findOneAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: `Task  ${id} not found` });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { createTask, deleteTask, getAllTasks, getTaskById, updateTask };
