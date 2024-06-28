import pkg from "@prisma/client";
const { PrismaClient, MilestoneStatus } = pkg;
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create milestone record
const createMilestone = asyncHandler(async (req, res) => {
  const { name, description, startDate, endDate } = req.body;
  try {
    const milestone = await prisma.milestone.create({
      data: {
        name,
        description,
        startDate,
        endDate,
        status: MilestoneStatus.PLANNED,
      },
    });

    res.status(201).json(milestone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all milestone records
const getAllMilestones = asyncHandler(async (req, res) => {
  try {
    const milestones = await prisma.milestone.findMany();

    res.status(200).json(milestones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all projects in a milestone
const getAllProjectsInMilestone = asyncHandler(async (req, res) => {
  const { milestoneId } = req.params;
  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        projects: true,
      },
    });

    if (!milestone) {
      return res
        .status(404)
        .json({ error: `Milestone ${milestoneId} not found` });
    }

    res.status(200).json(milestone.projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get milestone record by ID
const getMilestoneById = asyncHandler(async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      return res
        .status(404)
        .json({ error: `Milestone ${milestoneId} not found` });
    }

    res.status(200).json(milestone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update milestone record by ID
const updateMilestone = asyncHandler(async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { name, description, startDate, endDate } = req.body;

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      return res
        .status(404)
        .json({ error: `Milestone ${milestoneId} not found` });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { name, description, startDate, endDate },
    });

    res.status(200).json(updatedMilestone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete milestone record by ID
const deleteMilestone = asyncHandler(async (req, res) => {
  try {
    const { milestoneId } = req.params;

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      return res
        .status(404)
        .json({ error: `Milestone ${milestoneId} not found` });
    }

    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    res.status(204).json(`Milestone ${milestoneId} deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Add projects to milestone
const addProjectsToMilestone = asyncHandler(async (req, res) => {
  const { milestoneId } = req.params;
  const { projectIds } = req.body;
  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      return res
        .status(404)
        .json({ error: `Milestone ${milestoneId} not found` });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        projects: {
          connect: projectIds.map((projectId) => ({ id: projectId })),
        },
      },
      include: {
        projects: true,
      },
    });

    res.status(200).json(updatedMilestone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createMilestone,
  getAllMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  getAllProjectsInMilestone,
  addProjectsToMilestone,
};
