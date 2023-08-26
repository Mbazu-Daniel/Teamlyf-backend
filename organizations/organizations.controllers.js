import organizations from "./organizations.models.js";
import asyncHandler from "express-async-handler";

// Create a new organizations
const createOrganization = asyncHandler(async (req, res) => {
  try {
    const newOrganization = await organizations.create({ ...req.body });
    res.status(201).json(newOrganization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all organizations
const getAllOrganizations = asyncHandler(async (req, res) => {
  try {
    const organization = await organizations.find();
    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an organizations by ID
const getOrganizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await organizations.findById(id);
    if (!organization) {
      res.status(404).json(`organizations ${id} not found`);
    }
    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an organizations by ID
const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await organizations.findById(id);
    if (!organization) {
      res.status(404).json(`organizations ${id} not found`);
    }
    const updatedOrganization = await organizations.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    res.status(202).json(updatedOrganization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an organization by ID
const deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await organizations.findById(id);
    if (!organization) {
      return res.status(404).json(`Organization ${id} not found`);
    }
    await organizations.findByIdAndDelete(id);
    return res.status(204).json(`Organization ${id} deleted`);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
