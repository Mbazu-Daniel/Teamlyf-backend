import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TODO: Use checkOrganizationExist Middleware on routes

// Create a new team within an organization
const createTeam = asyncHandler(async (req, res) => {
  try {
    const { orgId } = req.params;
    const { id: userId } = req.user;
    const { name } = req.body;

    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if the team name already exists within the organization
    const existingTeam = await prisma.team.findFirst({
      where: { name, orgId },
    });

    if (existingTeam) {
      return res
        .status(400)
        .json({ error: `Team name "${name}" already exists.` });
    }

    // Create a new team using Prisma
    const newTeam = await prisma.team.create({
      data: {
        name,
        user: { connect: { id: userId } },
        organization: { connect: { id: orgId } },
      },
    });

    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all teams within an organization
const getAllTeams = asyncHandler(async (req, res) => {
  try {
    const { orgId } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { employees: true },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const teams = await prisma.team.findMany({
      where: { orgId },
    });

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a team by ID within an organization
const getTeamById = asyncHandler(async (req, res) => {
  const { orgId, teamId } = req.params;

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, orgId },
    });

    if (!team) {
      return res.status(404).json(`Team ${teamId} not found`);
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a team by ID within an organization
const deleteTeam = asyncHandler(async (req, res) => {
  const { orgId, teamId } = req.params;

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, orgId },
    });

    if (!team) {
      return res.status(404).json(`Team ${teamId} not found`);
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    res.status(204).json(`Team ${teamId} deleted`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a team by ID within an organization
const updateTeam = asyncHandler(async (req, res) => {
  const { orgId, teamId } = req.params;

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, orgId },
    });

    if (!team) {
      return res.status(404).json(`Team ${teamId} not found`);
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: req.body,
    });

    res.status(202).json(updatedTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add an employee to a team
const addEmployeeToTeam = asyncHandler(async (req, res) => {
  const { orgId, teamId } = req.params;
  const { email } = req.body;

  try {
    // Find the team and verify it exists
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        employees: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Find the employee based on their email address and organization
    const employee = await prisma.employee.findFirst({
      where: {
        email,
        orgId,
      },
    });

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found in the organization" });
    }

    // Check if the employee is already in the team
    if (team.employees.find((e) => e.id === employee.id)) {
      return res.status(400).json({ error: "Employee is already in the team" });
    }

    // Add the employee to the team's employees array
    await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        employees: {
          connect: {
            id: employee.id,
          },
        },
      },
    });

    res.status(201).json({ message: "Employee added to the team" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove an employee from a team
const removeEmployeeFromTeam = asyncHandler(async (req, res) => {
  const { orgId, teamId } = req.params;
  const { email } = req.body;

  try {
    // Find the team based on its ID and organization
    const team = await Team.findOne({
      _id: teamId,
      organization: orgId,
    });

    if (!team) {
      return res
        .status(404)
        .json({ error: "Team not found in the organization" });
    }

    // Find the employee based on their email address and organization
    const employee = await Employee.findOne({
      email,
      organization: orgId,
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

// Get a list of employees in a team
const getTeamEmployees = asyncHandler(async (req, res) => {
  const { orgId, teamId } = req.params;

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, orgId },
    });

    if (!team) {
      return res.status(404).json(`Team ${teamId} not found`);
    }

    const employees = await prisma.employee.findMany({
      where: { id: { in: team.employees } },
    });

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  createTeam,
  getAllTeams,
  getTeamById,
  deleteTeam,
  updateTeam,
  addEmployeeToTeam,
  removeEmployeeFromTeam,
  getTeamEmployees,
};
