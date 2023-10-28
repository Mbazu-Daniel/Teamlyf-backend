import { PrismaClient, TaskStatus } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();
// Create a new subtask
const createSubtask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, startDate, dueDate, status, collaboratorsId } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const subtaskData = {
      title,
      startDate: startDate || new Date(),
      dueDate: dueDate || null,
      status: status || TaskStatus.TO_DO,
      tasks: { connect: { id: taskId } },
      createdBy: { connect: { id: req.employeeId } },
    };

    const newSubtask = await prisma.subtask.create({
      data: subtaskData,
    });

    if (collaboratorsId && collaboratorsId.length > 0) {
      for (const collaborator of collaboratorsId) {
        await prisma.SubtaskCollaborator.create({
          data: {
            taskId: taskId,
            employeeId: collaborator,
          },
        });
      }
    }

    res.status(201).json(newSubtask);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all subtasks for a task
const getAllSubtasks = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  try {
    const subtasks = await prisma.subtask.findMany({
      where: {
        taskId,
      },
    });

    res.status(200).json(subtasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update subtask by ID
const updateSubtask = asyncHandler(async (req, res) => {
  const { id, taskId } = req.params;

  try {
    const subtask = await prisma.subtask.findUnique({
      where: {
        id,
      },
    });

    if (!subtask) {
      return res.status(404).json({ message: `Subtask ${id} not found` });
    }

    if (subtask.taskId !== taskId) {
      return res.status(404).json({
        message: `Subtask ${id} does not belong to the specified task`,
      });
    }

    const updatedSubtask = await prisma.subtask.update({
      where: {
        id,
      },
      data: req.body,
    });

    res.status(200).json(updatedSubtask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subtask by ID
const deleteSubtask = asyncHandler(async (req, res) => {
  const { id, taskId } = req.params;

  try {
    const subtask = await prisma.subtask.findUnique({
      where: {
        id,
      },
    });

    if (!subtask) {
      return res.status(404).json({ message: `Subtask ${id} not found` });
    }

    if (subtask.taskId !== taskId) {
      return res.status(404).json({
        message: `Subtask ${id} does not belong to the specified task`,
      });
    }

    // Delete the subtask if it exists
    await prisma.subtask.delete({
      where: {
        id,
      },
    });

    res.status(204).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { createSubtask, deleteSubtask, getAllSubtasks, updateSubtask };
