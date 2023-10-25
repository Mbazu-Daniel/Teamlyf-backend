import { PrismaClient, TaskAction } from "@prisma/client";
import asyncHandler from "express-async-handler";
const prisma = new PrismaClient();

//TODO: get tasks by their priority
//TODO: get tasks by their status
// TODO: get all tasks in the work place
// TODO: get tasks assigned to me

// Create a new task
const createTaskSpace = asyncHandler(async (req, res) => {
  const { workspaceId, spaceId } = req.params;
  const {
    title,
    description,
    labels,
    startDate,
    dueDate,
    priority,
    status,
    reminderDate,
    project,
    taskCollaborators,
  } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const taskData = {
      ...req.body,
      title,
      description,
      labels,
      startDate,
      dueDate,
      reminderDate,
      priority,
      status,
      createdBy: { connect: { id: req.employeeId } },
      spaces: { connect: { id: spaceId } },
      workspace: { connect: { id: workspaceId } },
    };

    if (project) {
      taskData.project = { connect: { id: project } };
    }

    // todo:
    if (taskCollaborators) {
      // Create a list of taskCollaborators
      const collaborators = taskCollaborators.map((id) => ({ id: id }));

      // Connect the collaborators to the task
      taskData.taskCollaborators = {
        create: collaborators,
      };
    }

    const newTask = await prisma.task.create({
      data: taskData,
    });

    // Log task addition in history using Prisma
    await prisma.taskHistory.create({
      data: {
        tasks: { connect: { id: newTask.id } },
        employee: { connect: { id: req.employeeId } },
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
  const { workspaceId, spaceId } = req.params;
  const { priorities, statuses } = req.query;
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
    const tasks = await prisma.task.findMany({
      where: {
        spaceId,
        priority: priorities ? { in: priorities.split(',') } : undefined,
        status: statuses ? { in: statuses.split(',') } : undefined,
      },
    });
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

// Get all tasks in the workspace
const getAllTasksInWorkspace = asyncHandler(async (req, res) => {
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

// Get task count in the workspace
const getTaskCountInWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  try {
    // Check if the workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "workspace not found" });
    }

    // Get the count of tasks in the workspace
    const taskCount = await prisma.task.count({
      where: {
        workspaceId: workspaceId,
      },
    });

    res.status(200).json({ count: taskCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createTaskSpace,
  deleteTaskSpace,
  getAllTasksInWorkspace,
  getAllTasksSpace,
  getTaskByIdSpace,
  getTaskCountInWorkspace,
  updateTaskSpace,
};
