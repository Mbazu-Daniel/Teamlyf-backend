import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();
// TODO: use checkTeamExist Middleware on routes

// Get all employees by organization
const getAllEmployees = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  try {
    const employees = await prisma.employee.findMany({
      where: {
        organizationId: orgId,
      },
    });
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get employee by ID by organization
const getEmployeeById = asyncHandler(async (req, res) => {
  const { orgId, employeeId } = req.params;

  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
        organizationId: orgId,
      },
    });

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
// Get employee by email
const getEmployeeByEmail = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { email } = req.query; // Use a query parameter for the email

  try {
    const employee = await prisma.employee.findFirst({
      where: {
        organizationId: orgId,
        email: email, // Email to search for
      },
    });

    if (!employee) {
      return res.status(404).json({
        message: `Employee with email ${email} not found in the organization`,
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee by ID by organization
const updateEmployee = asyncHandler(async (req, res) => {
  const { orgId, employeeId } = req.params;

  try {
    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
        organizationId: orgId,
      },
      data: req.body,
    });

    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee by ID by organization
const deleteEmployee = asyncHandler(async (req, res) => {
  const { orgId, employeeId } = req.params;

  try {
    await prisma.employee.delete({
      where: {
        id: employeeId,
        organizationId: orgId,
      },
    });

    res
      .status(204)
      .json({ message: `Employee ${employeeId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a list of teams that an employee is a member of in the organization
const getTeamsByEmployee = asyncHandler(async (req, res) => {
  const { orgId, employeeId } = req.params;

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
        orgId,
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
  const { orgId, employeeId } = req.params;
  const { role } = req.body;

  try {
    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if the employee exists within the organization
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, organizationId: orgId }, // Specify organizationId
    });

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found in the organization" });
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
  const { orgId } = req.params;
  const { query } = req.query;

  try {
    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Search for an employee by email address within the organization
    const employee = await prisma.employee.findFirst({
      where: {
        organizationId: orgId,
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
  const { orgId } = req.params;

  try {
    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Count the number of employees in the organization
    const employeeCount = await prisma.employee.count({
      where: { organizationId: orgId },
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
