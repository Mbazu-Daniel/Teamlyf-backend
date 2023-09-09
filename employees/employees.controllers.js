import asyncHandler from "express-async-handler";
import Employee from "./employees.models.js";
import Organization from "../organizations/organizations.models.js";
import Team from "../teams/teams.models.js";

// Get all employees by organization
const getAllEmployees = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  try {
    const employees = await Employee.find({
      organization: organizationId,
    });

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
const getEmployeeById = asyncHandler(async (req, res) => {
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
    }).populate("teams");
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
const updateEmployee = asyncHandler(async (req, res) => {
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
const deleteEmployee = asyncHandler(async (req, res) => {
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

// Add an employee to a team
const addEmployeeToTeam = asyncHandler(async (req, res) => {
  const { organizationId, teamId } = req.params;
  const { email } = req.body;

  try {
    // Find the organization and verify it exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Find the team and verify it exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Find the employee based on their email address and organization
    const employee = await Employee.findOne({
      email,
      organization: organizationId,
    });

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found in the organization" });
    }

    // Check if the employee is already in the team
    if (team.employees.includes(employee._id)) {
      return res.status(400).json({ error: "Employee is already in the team" });
    }

    // Add the employee to the team's employees array
    team.employees.push(employee._id);
    await team.save();

    // Add the team to the employee's teams array
    employee.teams.push(team._id);
    await employee.save();

    res.status(201).json({ message: "Employee added to the team" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove an employee from a team
const removeEmployeeFromTeam = asyncHandler(async (req, res) => {
  const { organizationId, teamId } = req.params;
  const { email } = req.body;

  try {
    // Check if the organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Find the team based on its ID and organization
    const team = await Team.findOne({
      _id: teamId,
      organization: organizationId,
    });

    if (!team) {
      return res
        .status(404)
        .json({ error: "Team not found in the organization" });
    }

    // Find the employee based on their email address and organization
    const employee = await Employee.findOne({
      email,
      organization: organizationId,
    });

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found in the organization" });
    }

    // Check if the employee is in the team
    if (!team.employees.includes(employee._id)) {
      return res.status(400).json({ error: "Employee is not in the team" });
    }

    // Remove the employee from the team
    team.employees.pull(employee._id);
    await team.save();

    // Remove the team from the employee's teams array
    employee.teams.pull(team._id);
    await employee.save();

    res
      .status(200)
      .json({ message: "Employee removed from the team successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a list of teams that an employee is a member of in the organization
const getTeamsByEmployee = asyncHandler(async (req, res) => {
  const { organizationId, employeeId } = req.params;

  try {
    // Find the organization and verify it exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    // Find the employee and verify it exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Find teams where the employee is a member
    const teams = await Team.find({
      _id: { $in: organization.teams },
      employees: employeeId,
    });

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const changeEmployeeRole = asyncHandler(async (req, res) => {
  const { organizationId, employeeId } = req.params;
  const { role } = req.body;

  try {
    // Check if the organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if the employee exists within the organization
    const employee = await Employee.findOne({
      _id: employeeId,
      organization: organizationId,
    });

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found in the organization" });
    }

    // Validate the new role to be either "Admin" or "Member"
    if (role !== "Admin" && role !== "Member") {
      return res
        .status(400)
        .json({ error: "Invalid role. Role must be 'Admin' or 'Member'" });
    }

    // Update the employee's role
    employee.role = role;
    await employee.save();

    res.status(200).json({ message: "Employee role updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const searchEmployees = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const { query } = req.query;

  try {
    // Check if the organization exists
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Search for employees based on the query parameter
    const employees = await Employee.find({
      organization: organizationId,
      $or: [
        { fullName: { $regex: new RegExp(query, "i") } },
        { email: { $regex: new RegExp(query, "i") } },
      ],
    });

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  addEmployeeToTeam,
  removeEmployeeFromTeam,
  getTeamsByEmployee,
  changeEmployeeRole,
  searchEmployees,
};
