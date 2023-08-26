import asyncHandler from "express-async-handler";
import Team from "./teams.models.js";

// Create a new team
const createTeam = asyncHandler(async (req, res) => {
  try {
    const newTeam = await Team.create(req.body);

    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all teams
const getAllTeams = asyncHandler(async (req, res) => {
  try {
    // const teams = await Team.find();
    res.status(200).json(await Team.find());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a team by ID
const getTeamById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const team = await Team.findById(id);
    if (!team) {
      res.status(404).json(`Team ${id} not found`);
    }
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a team by ID
const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const team = await Team.findById(id);
    if (!team) {
      res.status(404).json(`Team ${id} not found`);
    }
    await Team.findByIdAndDelete(id);
    res.status(204).json(`Team ${id} deleted`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a team by ID
const updateTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const team = await Team.findById(id);
    if (!team) {
      res.status(404).json(`Team ${id} not found`);
    }
    const updatedTeam = await Team.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(202).json(updatedTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { createTeam, getAllTeams, getTeamById, deleteTeam, updateTeam };
