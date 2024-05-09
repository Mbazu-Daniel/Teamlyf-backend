import pkg from "@prisma/client";
const { PrismaClient, EmployeeRole } = pkg;
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Get all employees by workspace
const getAllEmployees = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const employees = await prisma.employee.findMany({
      where: {
        workspaceId,
      },
    });
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
// Get employee by ID by workspace
const getCurrentEmployeeProfile = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const employeeId = req.employeeId;

  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
        workspaceId,
      },
    });

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee by ID by workspace
const updateEmployeeDetails = asyncHandler(async (req, res) => {
  const { workspaceId, employeeId } = req.params;

  try {
    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
        workspaceId,
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
  const { workspaceId } = req.params;
  const { employeeId } = req.body;

  try {
    await prisma.employee.delete({
      where: {
        id: employeeId,
        workspaceId,
      },
    });

    res
      .status(204)
      .json({ message: `Employee ${employeeId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee by email
const getEmployeeByEmail = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { email } = req.query;
  try {
    const employee = await prisma.employee.findFirst({
      where: {
        workspaceId,
        email,
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

// Get a list of teams that an employee is a member of in the workspace
const getTeamsByEmployee = asyncHandler(async (req, res) => {
  const { workspaceId, employeeId } = req.params;

  try {
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
  const { workspaceId } = req.params;
  const { employeeId, role } = req.body;
  console.log("🚀 ~ changeEmployeeRole ~ employeeId:", employeeId);

  try {
    // Check if the employee exists within the workspace
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, workspaceId },
    });

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found in the workspace" });
    }

    // Validate the new role to be either "Admin" or "Member"
    if (
      role !== EmployeeRole.ADMIN &&
      role !== EmployeeRole.MEMBER &&
      role !== EmployeeRole.GUEST
    ) {
      return res.status(400).json({
        error: "Invalid role. Role must be 'Admin' or 'Member' or 'Guest' ",
      });
    }

    // Update the employee's role
    const updatedUser = await prisma.employee.update({
      where: { id: employeeId },
      data: { role },
    });

    res
      .status(200)
      .json({ message: "Employee role updated successfully", updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Search Employees
const searchEmployees = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { query } = req.query;

  try {
    // Search for an employee by email address within the workspace
    const employee = await prisma.employee.findFirst({
      where: {
        workspaceId,
        email: query,
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
    // Count the number of employees in the workspace
    const employeeCount = await prisma.employee.count({
      where: { workspaceId },
    });

    res.status(200).json({ count: employeeCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// deactivate a employee
const deactivateEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;

  try {
    const updatedUser = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        isActive: false,
      },
    });

    res
      .status(200)
      .json(`${updatedUser.fullName} account has been deactivated`);
  } catch (error) {
    console.error(error);
  }
});
// activate a employee
const activateEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;

  try {
    const updatedUser = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        isActive: true,
      },
    });

    res.status(200).json(`${updatedUser.fullName} account has been activated`);
  } catch (error) {
    console.error(error);
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
  updateEmployeeDetails,
  getCurrentEmployeeProfile,
  deactivateEmployee,
  activateEmployee,
};
