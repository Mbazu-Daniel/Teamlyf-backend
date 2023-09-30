import asyncHandler from "express-async-handler";
import Project from "./projects.models.js";
import Space from "../spaces/spaces.models.js";

// Create a new project
const createProject = asyncHandler(async (req, res) => {
  const { title, spaceId } = req.body;
  const { id: createdBy } = req.user;
  try {
    // Check if a project with the same name already exists in the space
    const existingProject = await Project.findOne({ title, space: spaceId });

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
      createdBy: createdBy,
    });

    // Add the project to the space's projects array
    space.projects.push(project._id);
    await space.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all projects
const getAllProjects = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  try {
    // Find the space
    const space = await Space.findById(spaceId);
    if (!space) {
      return res.status(404).json({ message: `Space ${spaceId} not found` });
    }
    // Find all projects in the space
    const projects = await Project.find({ space: spaceId });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project  ${projectId} not found` });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project by ID
const updateProject = asyncHandler(async (req, res) => {
  const { projectId, spaceId } = req.params;
  const { ...updateFields } = req.body;
  try {
    const project = await Project.findByIdAndUpdate(projectId, req.body, {
      new: true,
    });
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project  ${projectId} not found` });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project by ID
const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findOneAndDelete({ _id: projectId });
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project  ${projectId} not found` });
    }

    // Find the associated space
    const space = await Space.findById(project.space);

    // Use $pull to remove the project from the space's projects array
    space.projects.pull(id);

    // Save the updated space
    await space.save();
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
