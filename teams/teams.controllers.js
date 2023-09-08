import asyncHandler from "express-async-handler";
import Team from "./teams.models.js";
import Organization from "../organizations/organizations.models.js";
import Employee from "../employees/employees.models.js";

// Create a new team within an organization
const createTeam = asyncHandler(async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { id: createdBy } = req.user;
    const { name } = req.body;

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // check if team exist already
    const existingTeam = await Team.findOne({
      name,
      organization: organizationId,
    });

    if (existingTeam) {
      return res
        .status(400)
        .json({ error: `Team name "${name}" already exists.` });
    }

    const newTeam = await Team.create({
      ...req.body,
      createdBy: createdBy,
      organization: organizationId,
    });

    // Add the team to the organization's list of teams
    organization.teams.push(newTeam._id);
    await organization.save();

    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all teams within an organization
const getAllTeams = asyncHandler(async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const teams = await Team.find({ organization: organizationId });

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a team by ID within an organization
const getTeamMembers = asyncHandler(async (req, res) => {
  const { organizationId, teamId } = req.params;

  try {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res
        .status(404)
        .json({ error: `Organization ${organizationId} not found` });
    }
    const team = await Team.findOne({
      _id: teamId,
      organization: organizationId,
    });
    if (!team) {
      res.status(404).json(`Team ${teamId} not found`);
    }

    // Fetch the members of the team
    const employees = await Employee.find({ _id: { $in: team.employees } });

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a team by ID within an organization
const deleteTeam = asyncHandler(async (req, res) => {
  const { organizationId, teamId } = req.params;

  try {
    const team = await Team.findOne({
      _id: teamId,
      organization: organizationId,
    });
    if (!team) {
      res.status(404).json(`Team ${teamId} not found`);
    }

    await Team.findByIdAndDelete(teamId);

    // Remove the team ID from the organization's list of teams
    const organization = await Organization.findById(organizationId);
    organization.teams.pull(teamId);
    await organization.save();

    res.status(204).json(`Team ${teamId} deleted`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a team by ID within an organization
const updateTeam = asyncHandler(async (req, res) => {
  const { organizationId, teamId } = req.params;

  try {
    const team = await Team.findOne({
      _id: teamId,
      organization: organizationId,
    });
    if (!team) {
      res.status(404).json(`Team ${teamId} not found`);
    }

    const updatedTeam = await Team.findByIdAndUpdate(teamId, req.body, {
      new: true,
    });

    res.status(202).json(updatedTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export { createTeam, getAllTeams, getTeamMembers, deleteTeam, updateTeam };
