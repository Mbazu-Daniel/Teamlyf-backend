import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// TODO: Use checkworkspaceExist Middleware on routes

// Create a new team within an workspace
const createTeam = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { id: userId } = req.user;
    const { name } = req.body;

    // Check if the workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "workspace not found" });
    }

    // Check if the team name already exists within the workspace
    const existingTeam = await prisma.team.findFirst({
      where: { name, workspaceId },
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
        workspace: { connect: { id: workspaceId } },
      },
    });

    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all teams within an workspace
const getAllTeams = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { employees: true },
    });

    if (!workspace) {
      return res.status(404).json({ error: "workspace not found" });
    }

    const teams = await prisma.team.findMany({
      where: { workspaceId },
    });

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a team by ID within an workspace
const getTeamById = asyncHandler(async (req, res) => {
  const { workspaceId, teamId } = req.params;

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, workspaceId },
    });

    if (!team) {
      return res.status(404).json(`Team ${teamId} not found`);
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a team by ID within an workspace
const deleteTeam = asyncHandler(async (req, res) => {
  const { workspaceId, teamId } = req.params;

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, workspaceId },
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

// Update a team by ID within an workspace
const updateTeam = asyncHandler(async (req, res) => {
  const { workspaceId, teamId } = req.params;

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, workspaceId },
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
  const { workspaceId, teamId } = req.params;
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

    // Find the employee based on their email address and workspace
    const employee = await prisma.employee.findFirst({
      where: {
        email,
        workspaceId,
      },
    });

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found in the workspace" });
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
  const { workspaceId, teamId } = req.params;
  const { email } = req.body;

  try {
    // Find the team based on its ID and workspace
    const team = await Team.findOne({
      _id: teamId,
      workspace: workspaceId,
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found in the workspace" });
    }

    // Find the employee based on their email address and workspace
    const employee = await Employee.findOne({
      email,
      workspace: workspaceId,
    });

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee not found in the workspace" });
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
  const { workspaceId, teamId } = req.params;

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, workspaceId },
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
  addEmployeeToTeam,
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  getTeamEmployees,
  removeEmployeeFromTeam,
  updateTeam,
};
