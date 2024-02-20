import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create event
const createEvent = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const {
      title,
      flier,
      description,
      location,
      startDate,
      endDate,
      timezone,
      isPublished,
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        flier,
        description,
        location,
        startDate,
        endDate,
        timezone,
        isPublished,
        createdBy: { connect: { id: req.employeeId } },
        workspace: { connect: { id: workspaceId } },
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all events
const getAllEvents = asyncHandler(async (req, res) => {
  try {
    const events = await prisma.event.findMany();

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get event by ID
const getEventById = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: `Event ${eventId} not found` });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update event by ID
const updateEvent = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      flier,
      description,
      location,
      startDate,
      endDate,
      timezone,
      isPublished,
    } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: `Event ${eventId} not found` });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        flier,
        description,
        location,
        startDate,
        endDate,
        timezone,
        isPublished,
      },
    });

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete event by ID
const deleteEvent = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: `Event ${eventId} not found` });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    res.status(204).json(`Event ${eventId} deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
