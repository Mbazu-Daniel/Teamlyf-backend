import { PrismaClient, TeamRole } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// TODO: search employee in a team by email
// Create a new team within an workspace
const createTeam = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, alias, employeeIds, roles } = req.body;

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
        alias,
        workspace: { connect: { id: workspaceId } },
      },
    });

    // Create an employee-team association for the team creator as ADMIN
    await prisma.employeeTeam.create({
      data: {
        teamCreator: { connect: { id: req.employeeId } },
        team: { connect: { id: newTeam.id } },
        role: TeamRole.LEAD,
      },
    });

    // Create multiple employee-team associations
    if (employeeIds && employeeIds.length > 0) {
      await prisma.employeeTeam.createMany({
        data: employeeIds.map((employeeId, index) => ({
          employeeId,
          teamId: newTeam.id,
          role: roles && roles[index] ? roles[index] : TeamRole.MEMBER,
        })),
      });
    }

    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all teams within an workspace
const getAllTeams = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const teams = await prisma.team.findMany({
      where: { workspaceId },
      include: {
        employeeTeam: {
          select: { employeeId: true, role: true },
        },
      },
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
      include: {
        employeeTeam: {
          select: { employeeId: true, role: true },
        },
      },
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
    await prisma.team.delete({
      where: { id: teamId },
    });

    res.status(204).json(`Team ${teamId} deleted`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const updateTeam = asyncHandler(async (req, res) => {
  const { teamId, workspaceId } = req.params;
  // Handle associated team
  const { name, alias } = req.body;
  try {
    // Check if the team exists
    const team = await prisma.team.findFirst({
      where: { id: teamId, workspaceId },
      include: { employeeTeam: true },
    });

    if (!team) {
      return res.status(404).json(`Team ${teamId} not found`);
    }

    const teamCreatorId = req.employeeId;

    // Update the team details
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { name, alias },
    });

    // Handle associated employee-team relationships
    const { employeeIds, roles, teamCreatorRole } = req.body;

    if (employeeIds && employeeIds.length > 0) {
      // Update or create the teamCreator's role
      await prisma.employeeTeam.upsert({
        where: {
          employeeId_teamId: { employeeId: teamCreatorId, teamId },
        },
        create: {
          teamId,
          employeeId: teamCreatorId,
          role: TeamRole.LEAD || teamCreatorRole,
        },
        update: {
          role: TeamRole.LEAD || teamCreatorRole,
        },
      });

      // Create or update roles for other team members
      await prisma.employeeTeam.createMany({
        data: employeeIds.map((employeeId, index) => ({
          teamId,
          employeeId,
          role: roles && roles[index] ? roles[index] : TeamRole.MEMBER,
        })),
        onConflict: {
          target: ["teamId", "employeeId"],
          action: {
            update: {
              role: (_, options) =>
                roles && roles[options.index]
                  ? roles[options.index]
                  : TeamRole.MEMBER,
            },
          },
        },
      });
    }

    res.status(202).json(updatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const updateTeamDetails = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { name, alias } = req.body;

  try {
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { name, alias },
    });

    res.status(202).json(updatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const updateEmployeeRoles = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { employeeIds, roles, teamCreatorRole } = req.body;

  try {
    const teamCreatorId = req.employeeId;

    // Update or create the teamCreator's role
    await prisma.employeeTeam.upsert({
      where: {
        employeeId_teamId: { employeeId: teamCreatorId, teamId },
      },
      create: {
        teamId,
        employeeId: teamCreatorId,
        role: teamCreatorRole || TeamRole.LEAD,
      },
      update: {
        role: teamCreatorRole || TeamRole.LEAD,
      },
    });

    // Create or update roles for other team members
    for (let index = 0; index < employeeIds.length; index++) {
      const employeeId = employeeIds[index];
      const role = roles && roles[index] ? roles[index] : TeamRole.MEMBER;

      await prisma.employeeTeam.upsert({
        where: {
          employeeId_teamId: { employeeId, teamId },
        },
        create: {
          teamId,
          employeeId,
          role,
        },
        update: {
          role,
        },
      });
    }
    // Fetch the updated team details
    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: { employeeTeam: { select: { employeeId: true, role: true } } },
    });
    res.status(202).json(updatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Add employees to a team with dynamic roles
const addEmployeesToTeam = asyncHandler(async (req, res) => {
  const { workspaceId, teamId } = req.params;
  const { employeeData } = req.body;

  try {
    const existingRelationships = await prisma.employeeTeam.findMany({
      where: {
        teamId,
        employeeId: { in: employeeData.map((data) => data.employeeId) },
      },
    });

    const existingEmployeeIds = existingRelationships.map((rel) => rel.employeeId);
    const newEmployeeData = employeeData.filter((data) => !existingEmployeeIds.includes(data.employeeId));


    // If all employees already exist, respond with an error
    if (newEmployeeData.length === 0) {
      return res.status(400).json({ error: "All employees are already in the team" });
    }
    const createdEmployees = await prisma.employeeTeam.createMany({
      data: newEmployeeData.map((data) => ({
        teamId,
        employeeId: data.employeeId,
        role: data.role || TeamRole.MEMBER,
      })),
      skipDuplicates: true,
    });

    // Fetch the updated team details
    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: { employeeTeam: { select: { employeeId: true, role: true } } },
    });

    res
      .status(201)
      .json({ message: "Employees added to the team", updatedTeam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Remove employees from a team
const removeEmployeesFromTeam = asyncHandler(async (req, res) => {
  const {  teamId } = req.params;
  const { employeeIds } = req.body;

  try {
    // Check if the employees are in the team
    const existingRelationships = await prisma.employeeTeam.findMany({
      where: {
        employeeId: { in: employeeIds },
        teamId,
      },
    });

    const missingEmployees = employeeIds.filter(
      (id) => !existingRelationships.some((rel) => rel.employeeId === id)
    );

    if (missingEmployees.length > 0) {
      return res
        .status(400)
        .json({ error: `Employees (${missingEmployees.join(', ')}) are not in the team` });
    }

    // Remove the employees from the team
    await prisma.employeeTeam.deleteMany({
      where: {
        employeeId: { in: employeeIds },
        teamId,
      },
    });

    res.status(204).json({ message: "Employees removed from the team successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const getEmployeesInTeam = asyncHandler(async (req, res) => {
  const {  teamId } = req.params;

  try {
    const teamMembers = await prisma.employeeTeam.findMany({
      where: { teamId }, select: { employeeId: true, role: true }
    });

  
    res.status(200).json({teamMembers: teamMembers});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export {
  addEmployeesToTeam,
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  getEmployeesInTeam,
  removeEmployeesFromTeam,
  updateTeam,
  updateTeamDetails,
  updateEmployeeRoles,
};
