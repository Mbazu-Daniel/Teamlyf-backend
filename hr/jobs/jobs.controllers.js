import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// create a new job
const createJob = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description } = req.body;

    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        employee: { connect: { id: req.employeeId } },
        workspace: { connect: { id: workspaceId } },
      },
    });
    res.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
const getAllJobs = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { active } = req.query;

    let jobs;
    if (active === "true") {
      jobs = await prisma.job.findMany({
        where: {
          workspaceId,
          isActive: true,
        },
      });
    } else {
      jobs = await prisma.job.findMany({
        where: {
          workspaceId,
        },
      });
    }

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const getJobById = asyncHandler(async (req, res) => {
  try {
    const { workspaceId, jobId } = req.params;
    const jobs = await prisma.job.findUnique({
      where: {
        id: jobId,
        workspaceId,
      },
    });
    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
const updateJobDetails = asyncHandler(async (req, res) => {
  try {
    const { workspaceId, jobId } = req.params;
    const jobs = await prisma.job.findUnique({
      where: {
        id: jobId,
        workspaceId,
      },
    });
    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
const updateJobStatus = asyncHandler(async (req, res) => {
  try {
    const { workspaceId, jobId } = req.params;
    const { isActive } = req.body;
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
        workspaceId,
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Update the job status
    const updatedJob = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        isActive: isActive,
      },
    });
    res.status(200).json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
const deleteJob = asyncHandler(async (req, res) => {
  try {
    const { workspaceId, jobId } = req.params;
    const jobs = await prisma.job.findUnique({
      where: {
        id: jobId,
        workspaceId,
      },
    });
    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createJob,
  getAllJobs,
  getJobById,
  updateJobDetails,
  updateJobStatus,
  deleteJob,
};
