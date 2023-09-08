import asyncHandler from "express-async-handler";
import Employee from "./employees.models.js";
import Organization from "../organizations/organizations.models.js";
import Team from "../teams/teams.models.js";

// Get all employees by organization
const getAllEmployeesByOrganization = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  try {
    const employees = await Employee.find({ organization: organizationId });

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res
        .status(404)
        .json({ error: `Organization ${organizationId} not found` });
    }

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee by ID by organization
const getEmployeeByIdByOrganization = asyncHandler(async (req, res) => {
  const { organizationId, employeeId } = req.params;
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res
        .status(404)
        .json({ error: `Organization ${organizationId} not found` });
    }

    const employee = await Employee.findOne({
      _id: employeeId,
      organization: organizationId,
    });
    if (!employee) {
      return res.status(404).json({
        message: `Employee ${employeeId} not found in the organization`,
      });
    }

    if (!organizationId) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee by ID by organization
const updateEmployeeByOrganization = asyncHandler(async (req, res) => {
  const { organizationId, employeeId } = req.params;
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res
        .status(404)
        .json({ error: `Organization ${organizationId} not found` });
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: employeeId, organization: organizationId },
      req.body,
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({
        message: `Employee ${employeeId} not found in the organization`,
      });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee by ID by organization
const deleteEmployeeByOrganization = asyncHandler(async (req, res) => {
  const { organizationId, employeeId } = req.params;
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res
        .status(404)
        .json({ error: `Organization ${organizationId} not found` });
    }

    const employee = await Employee.findOneAndDelete({
      _id: employeeId,
      organization: organizationId,
    });
    if (!employee) {
      return res.status(404).json({
        message: `Employee ${employeeId} not found in the organization`,
      });
    }
    res
      .status(204)
      .json({ message: `Employee ${employeeId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  getAllEmployeesByOrganization,
  getEmployeeByIdByOrganization,
  updateEmployeeByOrganization,
  deleteEmployeeByOrganization,
};
