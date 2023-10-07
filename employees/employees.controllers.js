import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// TODO: use checkTeamExist Middleware on routes

// Get all employees by organization
const getAllEmployees = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  try {
    const employees = await prisma.employee.findMany({
      where: {
        orgId: orgId,
      },
    });
    res.status(200).json(employees);
  } catch (error) {
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
        orgId,
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

// Update employee by ID by organization
const updateEmployee = asyncHandler(async (req, res) => {
  const { orgId, employeeId } = req.params;

  try {
    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
        orgId,
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
        orgId,
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
      where: { id: employeeId, orgId },
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

    // Search for employees based on the query parameter
    const employees = await prisma.employee.findMany({
      where: {
        orgId,
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    res.status(200).json(employees);
  } catch (error) {
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
      where: { orgId },
    });

    res.status(200).json({ count: employeeCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getTeamsByEmployee,
  changeEmployeeRole,
  searchEmployees,
  getEmployeesCount,
};
