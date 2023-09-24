import asyncHandler from "express-async-handler";
import Space from "./spaces.models.js";

// TODO: use checkOrganizationExist Middleware on routes

// Create a new space
const createSpace = asyncHandler(async (req, res) => {
  const { id: createdBy } = req.user;
  const { organization } = req;
  const { title } = req.body;
  try {
    // check if the title exist in the organization
    const existingSpace = await Space.findOne({
      title,
      organization: organization._id,
    });
    if (existingSpace) {
      return res.status(400).json({ error: `Space ${title} already exists` });
    }
    const space = await Space.create({
      ...req.body,
      createdBy: createdBy,
      organization: organization._id,
    });

    // Push the space ID to the organization's spaces array
    organization.spaces.push(space._id);
    await organization.save();

    res.status(201).json(space);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all spaces
const getAllSpaces = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  try {
    const spaces = await Space.find({ organization: organizationId });
    res.status(200).json(spaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get space by ID
const getSpaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const space = await Space.findById({
      _id: id,
      organization: req.organization._id,
    });
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
  const { id } = req.params;
  try {
    const space = await Space.findByIdAndUpdate(
      { _id: id, organization: req.organization._id },
      req.body,
      {
        new: true,
      }
    );
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
  const { organization } = req;
  try {
    const space = await Space.findOneAndDelete({ _id: id });

    if (!space) {
      return res.status(404).json({ message: `Space  ${id} not found` });
    }

    // Remove the space ID from the organization's spaces array
    organization.spaces.pull(space._id);
    await organization.save();

    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { createSpace, getAllSpaces, getSpaceById, deleteSpace, updateSpace };
