import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create education record
const createEducation = asyncHandler(async (req, res) => {
  try {
    const { institution, courseOfStudy, result, degree, startDate, endDate } =
      req.body;

    const education = await prisma.education.create({
      data: {
        institution,
        courseOfStudy,
        result,
        degree,
        startDate,
        endDate,
        employee: { connect: { id: req.employeeId } },
      },
    });

    res.status(201).json(education);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all education records for an employee
const getAllEducations = asyncHandler(async (req, res) => {
  try {
    const employeeId = req.employeeId;

    const educations = await prisma.education.findMany({
      where: {
        employeeId,
      },
    });

    res.status(200).json(educations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get education record by ID
const getEducationById = asyncHandler(async (req, res) => {
  try {
    const { educationId } = req.params;
    const education = await prisma.education.findUnique({
      where: { id: educationId },
    });

    if (!education) {
      return res
        .status(404)
        .json({ error: `Education record ${educationId} not found` });
    }

    res.status(200).json(education);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update education record by ID
const updateEducation = asyncHandler(async (req, res) => {
  try {
    const { educationId } = req.params;
    const { institution, courseOfStudy, result, degree, startDate, endDate } =
      req.body;

    const education = await prisma.education.findUnique({
      where: { id: educationId },
    });

    if (!education) {
      return res
        .status(404)
        .json({ error: `Education record ${educationId} not found` });
    }

    const updatedEducation = await prisma.education.update({
      where: { id: educationId },
      data: { institution, courseOfStudy, result, degree, startDate, endDate },
    });

    res.status(200).json(updatedEducation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete education record by ID
const deleteEducation = asyncHandler(async (req, res) => {
  try {
    const { educationId } = req.params;

    const education = await prisma.education.findUnique({
      where: { id: educationId },
    });

    if (!education) {
      return res
        .status(404)
        .json({ error: `Education record ${educationId} not found` });
    }

    await prisma.education.delete({
      where: { id: educationId },
    });

    res.status(204).json(`Education record ${educationId} deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createEducation,
  getAllEducations,
  getEducationById,
  updateEducation,
  deleteEducation,
};
