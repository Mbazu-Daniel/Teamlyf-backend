import asyncHandler from "express-async-handler";
import Space from "./spaces.models.js";

// Create a new space
const createSpace = asyncHandler(async (req, res) => {
  try {
    const space = await Space.create(req.body);
    res.status(201).json(space);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all spaces
const getAllSpaces = asyncHandler(async (req, res) => {
  try {
    const spaces = await Space.find();
    res.status(200).json(spaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get space by ID
const getSpaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const space = await Space.findById(id);
    if (!space) {
      return res.status(404).json({ message: `Space  ${id} not found` });
    }
    res.status(200).json(space);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update space by ID
const updateSpace = asyncHandler(async (req, res) => {
  const {id} = req.params
  try {
    const space = await Space.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!space) {
      return res.status(404).json({ message: `Space  ${id} not found` });
    }
    res.status(200).json(space);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete space by ID
const deleteSpace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const space = await Space.findByIdAndRemove(id);
    if (!space) {
      return res.status(404).json({ message: `Space  ${id} not found` });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  createSpace,
  getAllSpaces,
  getSpaceById,
  deleteSpace,
  updateSpace,
};
