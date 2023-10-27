import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();
// TODO: use checkTeamExist Middleware on routes


// Get all employees by workspace
const getAllEmployees = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const employees = await prisma.employee.findMany({
      where: {
        workspaceId: workspaceId,
      },
    })
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get employee by ID by workspace
const getEmployeeById = asyncHandler(async (req, res) => {
  const { workspaceId, employeeId } = req.params;

  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
        workspaceId,
      },
    });

    if (!employee) {
      return res.status(404).json({
        message: `Employee ${employeeId} not found in the workspace`,
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get employee by email
const getEmployeeByEmail = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { email } = req.query; // Use a query parameter for the email

  try {
    const employee = await prisma.employee.findFirst({
      where: {
        workspaceId: workspaceId,
        email: email, // Email to search for
      },
    });

    if (!employee) {
      return res.status(404).json({
        message: `Employee with email ${email} not found in the workspace`,
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee by ID by workspace
const updateEmployee = asyncHandler(async (req, res) => {
  const { workspaceId, employeeId } = req.params;

  try {
    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
        workspaceId: workspaceId,
      },
      data: req.body,
    });

    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee by ID by workspace
const deleteEmployee = asyncHandler(async (req, res) => {
  const { workspaceId, employeeId } = req.params;

  try {
    await prisma.employee.delete({
      where: {
        id: employeeId,
        workspaceId: workspaceId,
      },
    });

    res
      .status(204)
      .json({ message: `Employee ${employeeId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a list of teams that an employee is a member of in the workspace
const getTeamsByEmployee = asyncHandler(async (req, res) => {
  const { workspaceId, employeeId } = req.params;

  try {
    // Find the employee and verify it exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Find teams where the employee is a member
    const teams = await prisma.team.findMany({
      where: {
        workspaceId,
        employees: { some: { id: employeeId } },
      },
    });

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change Employee Role
const changeEmployeeRole = asyncHandler(async (req, res) => {
  const { workspaceId, employeeId } = req.params;
  const { role } = req.body;

  try {
    // Check if the workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "workspace not found" });
    }

    // Check if the employee exists within the workspace
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, workspaceId: workspaceId }, // Specify workspaceId
    });

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found in the workspace" });
    }

    // Validate the new role to be either "Admin" or "Member"
    if (role !== "ADMIN" && role !== "MEMBER") {
      return res
        .status(400)
        .json({ error: "Invalid role. Role must be 'Admin' or 'Member'" });
    }

    // Update the employee's role
    await prisma.employee.update({
      where: { id: employeeId },
      data: { role },
    });

    res.status(200).json({ message: "Employee role updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search Employees
const searchEmployees = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { query } = req.query;

  try {
    // Check if the workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "workspace not found" });
    }

    // Search for an employee by email address within the workspace
    const employee = await prisma.employee.findFirst({
      where: {
        workspaceId: workspaceId,
        email: query, // Email to search for
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get Employee Count
const getEmployeesCount = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  try {
    // Check if the workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "workspace not found" });
    }

    // Count the number of employees in the workspace
    const employeeCount = await prisma.employee.count({
      where: { workspaceId: workspaceId },
    });

    res.status(200).json({ count: employeeCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  changeEmployeeRole,
  deleteEmployee,
  getAllEmployees,
  getEmployeeByEmail,
  getEmployeeById,
  getEmployeesCount,
  getTeamsByEmployee,
  searchEmployees,
  updateEmployee,
};
