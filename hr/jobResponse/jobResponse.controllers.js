import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create a new job response
const createJobResponse = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resume, other } = req.body;

    const newJobResponse = await prisma.jobApplicantResponse.create({
      data: {
        job: { connect: { id: jobId } },
        coverLetter,
        resume,
        other,
      },
    });
    res.status(201).json(newJobResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all job responses for a specific job
const getAllJobResponses = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobResponses = await prisma.jobApplicantResponse.findMany({
      where: {
        jobId,
      },
    });
    res.status(200).json(jobResponses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific job response by ID
const getJobResponseById = asyncHandler(async (req, res) => {
  try {
    const { jobId, responseId } = req.params;
    const jobResponse = await prisma.jobApplicantResponse.findUnique({
      where: {
        id: responseId,
      },
    });
    res.status(200).json(jobResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update a job response
const updateJobResponse = asyncHandler(async (req, res) => {
  try {
    const { jobId, responseId } = req.params;
    const { coverLetter, resume, other } = req.body;

    const updatedJobResponse = await prisma.jobApplicantResponse.update({
      where: {
        id: responseId,
      },
      data: {
        coverLetter,
        resume,
        other,
      },
    });
    res.status(200).json(updatedJobResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a job response
const deleteJobResponse = asyncHandler(async (req, res) => {
  try {
    const { jobId, responseId } = req.params;
    await prisma.jobApplicantResponse.delete({
      where: {
        id: responseId,
      },
    });
    res.status(200).json({ message: "Job response deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createJobResponse,
  getAllJobResponses,
  getJobResponseById,
  updateJobResponse,
  deleteJobResponse,
};
