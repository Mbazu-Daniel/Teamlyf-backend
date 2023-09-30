import asyncHandler from "express-async-handler";
import Task from "./tasks.models.js";

// Create a new task
const createTask = asyncHandler(async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tasks
const getAllTasks = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
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

export { createTask, getAllTasks, getTaskById, deleteTask, updateTask };
