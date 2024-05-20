import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import asyncHandler from "express-async-handler";
import { novuNotifier } from "../../utils/services/novu.js";

const prisma = new PrismaClient();

// Create announcements
const createAnnouncements = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const {
      title,
      description,

      isPublished,
    } = req.body;

    const announcements = await prisma.announcement.create({
      data: {
        title,
        description,
        isPublished,
        createdBy: { connect: { id: req.employeeId } },
        workspace: { connect: { id: workspaceId } },
      },
    });

    res.status(201).json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all announcements
const getAllAnnouncements = asyncHandler(async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany();

    res.status(200).json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get announcements by ID
const getAnnouncementsById = asyncHandler(async (req, res) => {
  try {
    const { announcementsId } = req.params;
    const announcements = await prisma.announcement.findUnique({
      where: { id: announcementsId },
    });

    if (!announcements) {
      return res
        .status(404)
        .json({ error: `Announcements ${announcementsId} not found` });
    }

    res.status(200).json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update announcements by ID
const updateAnnouncements = asyncHandler(async (req, res) => {
  try {
    const { announcementsId } = req.params;
    const {
      title,
      description,

      isPublished,
    } = req.body;

    const announcements = await prisma.announcement.findUnique({
      where: { id: announcementsId },
    });

    if (!announcements) {
      return res
        .status(404)
        .json({ error: `Announcements ${announcementsId} not found` });
    }

    const updatedAnnouncements = await prisma.announcement.update({
      where: { id: announcementsId },
      data: {
        title,

        description,

        isPublished,
      },
    });

    res.status(200).json(updatedAnnouncements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete announcements by ID
const deleteAnnouncements = asyncHandler(async (req, res) => {
  try {
    const { announcementsId } = req.params;

    const announcements = await prisma.announcement.findUnique({
      where: { id: announcementsId },
    });

    if (!announcements) {
      return res
        .status(404)
        .json({ error: `Announcements ${announcementsId} not found` });
    }

    await prisma.announcement.delete({
      where: { id: announcementsId },
    });

    res.status(204).json(`Announcements ${announcementsId} deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createAnnouncements,
  getAllAnnouncementss,
  getAnnouncementsById,
  updateAnnouncements,
  deleteAnnouncements,
};
