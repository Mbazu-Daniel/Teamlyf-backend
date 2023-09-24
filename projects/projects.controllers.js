import asyncHandler from "express-async-handler";
import Project from "./projects.models.js";
import Space from "../spaces/spaces.models.js";

// Create a new project
const createProject = asyncHandler(async (req, res) => {
  try {
    const { title, spaceId } = req.body;

    // Check if a project with the same name already exists in the space
    const existingProject = await Project.findOne({ title, space: spaceId });
    console.log("spaceId: " + spaceId);
    if (!spaceId) {
      return res.status(400).json({
        error: `Space ${spaceId} does not exists`,
      });
    }

    if (existingProject) {
      return res.status(400).json({
        error: `${title} already exists`,
      });
    }
    const project = await Project.create({
      title,
      space: spaceId,
      createdBy: req.user.id,
    });

    // Add the project to the space's projects array
    const space = await Space.findByIdAndUpdate(spaceId, {
      $addToSet: { projects: project._id },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all projects
const getAllProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: `Project  ${id} not found` });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project by ID
const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!project) {
      return res.status(404).json({ message: `Project  ${id} not found` });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project by ID
const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findOneAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: `Project  ${id} not found` });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject,
  updateProject,
};
