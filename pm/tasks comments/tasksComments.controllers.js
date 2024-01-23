import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createTaskComment = asyncHandler(async (req, res) => {
  const { taskId, workspaceId, spaceId } = req.params;
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const taskComment = await prisma.taskComment.create({
      data: {
        text,
        employee: { connect: { id: req.employeeId } },
        tasks: { connect: { id: taskId } },
      },
    });

    res.status(201).json(taskComment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

const getTaskComments = asyncHandler(async (req, res) => {
  const { taskId, workspaceId, spaceId } = req.params;

  try {
    const taskComments = await prisma.taskComment.findMany({
      where: {
        taskId,
      },
    });

    res.status(200).json(taskComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const updateTaskComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const taskComment = await prisma.taskComment.findUnique({
      where: {
        id,
      },
    });

    if (!taskComment) {
      return res.status(404).json({ message: `TaskComment ${id} not found` });
    }

    const updatedTaskComment = await prisma.taskComment.update({
      where: {
        id,
      },
      data: req.body,
    });

    res.status(200).json(updatedTaskComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const deleteTaskComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const taskComment = await prisma.taskComment.findUnique({
      where: {
        id,
      },
    });

    if (!taskComment) {
      return res.status(404).json({ message: `TaskComment ${id} not found` });
    }

    await prisma.taskComment.delete({
      where: {
        id,
      },
    });

    res.status(204).json({ message: "TaskComment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



export {
  createTaskComment,
  getTaskComments,
  deleteTaskComment,
  updateTaskComment,
};
