import asyncHandler from "express-async-handler";

// Create a new subTask
const createSubTask = asyncHandler(async (req, res) => {
  try {
    const subTask = await SubTask.create(req.body);
    res.status(201).json(subTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all subTasks
const getAllSubTasks = asyncHandler(async (req, res) => {
  try {
    const subTasks = await SubTask.find();
    res.status(200).json(subTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subTask by ID
const getSubTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const subTask = await SubTask.findById(id);
    if (!subTask) {
      return res.status(404).json({ message: `SubTask  ${id} not found` });
    }
    res.status(200).json(subTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update subTask by ID
const updateSubTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const subTask = await SubTask.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!subTask) {
      return res.status(404).json({ message: `SubTask  ${id} not found` });
    }
    res.status(200).json(subTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subTask by ID
const deleteSubTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const subTask = await SubTask.findOneAndDelete(id);
    if (!subTask) {
      return res.status(404).json({ message: `SubTask  ${id} not found` });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  createSubTask,
  getAllSubTasks,
  getSubTaskById,
  deleteSubTask,
  updateSubTask,
};
