import Organization from "./organizations.models.js";
import Employee from "../employees/employees.models.js";
import asyncHandler from "express-async-handler";

// Create a new organizations
const createOrganization = asyncHandler(async (req, res) => {
  const { createdBy } = req.user.id;
  const { name } = req.body;

  // Check if an organization with the same name already exists
  const existingOrganization = await Organization.findOne({ name });

  if (existingOrganization) {
    return res
      .status(400)
      .json({ error: `Organization name ${name} already exists.` });
  }

  try {
    // Create a new organization with the provided data
    const newOrganization = await Organization.create({
      ...req.body,
      createdBy: createdBy,
    });

    // Create a new employee associated with the user who created the organization
    const user = req.user.id;
    console.log(
      "🚀 ~ file: organizations.controllers.js:18 ~ createOrganization ~ user:",
      user
    );
    const fullName = req.user.fullName;
    console.log(
      "🚀 ~ file: organizations.controllers.js:20 ~ createOrganization ~ fullName:",
      fullName
    );
    const email = req.user.email;
    console.log(
      "🚀 ~ file: organizations.controllers.js:22 ~ createOrganization ~ email:",
      email
    );

    const newEmployee = await Employee.create({
      user: req.user.id,
      organization: newOrganization._id,
      fullName: req.user.fullName,
      email: req.user.email,
      password: req.user.password,
      role: "Owner",
    });

    // add the newly created employee to the the organization's employee array
    newOrganization.employees.push(newEmployee);
    await newOrganization.save();

    res.status(201).json(newOrganization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all organizations
const getAllOrganizations = asyncHandler(async (req, res) => {
  try {
    const organization = await Organization.find();
    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an Organization by ID
const getOrganizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await Organization.findById(id);
    if (!organization) {
      res.status(404).json(`Organization ${id} not found`);
    }
    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an Organization by ID
const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await Organization.findById(id);
    if (!organization) {
      res.status(404).json(`Organization ${id} not found`);
    }
    const updatedOrganization = await Organization.findByIdAndUpdate(
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
    const organization = await Organization.findByIdAndDelete(id);
    if (!organization) {
      return res.status(404).json(`Organization ${id} not found`);
    }
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
