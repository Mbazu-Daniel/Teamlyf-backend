import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create multiple leave types
const createLeaveTypes = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const employeeId = req.employeeId;
    const { leaveTypes } = req.body;
    // Check for existing names
    const existingNames = await prisma.leaveType.findMany({
        where: {
          workspaceId,
          name: { in: leaveTypes.map((lt) => lt.name) },
        },
      });
  
      if (existingNames.length > 0) {
        return res.status(400).json({
          error: `Leave types with names (${existingNames.map((index) => index.name).join(', ')}) already exist`,
        });
      }
    const createdLeaveTypes = await prisma.leaveType.createMany({
      data: leaveTypes.map((leaveType) => ({
        name: leaveType.name,
        employeeId: employeeId,
        workspaceId: workspaceId,
      })),
      skipDuplicates: true,
    });

    const allLeaveType = await prisma.leaveType.findMany({
      where: {
        workspaceId,
      },
      select: { id: true, name: true },
    });

    res.status(201).json({ leaveTypes: allLeaveType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all leave types in workspace
const getAllLeaveTypes = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        workspaceId,
      },
      select: { id: true, name: true },
    });

    res.status(200).json(leaveTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get leave type by ID
const getLeaveTypeById = asyncHandler(async (req, res) => {
  try {
    const { leaveTypeId, workspaceId } = req.params;
    const leaveType = await prisma.leaveType.findUnique({
      where: { workspaceId, id: leaveTypeId },
      select: { id: true, name: true },
    });

    if (!leaveType) {
      return res
        .status(404)
        .json({ error: `Leave type ${leaveTypeId} not found` });
    }

    res.status(200).json(leaveType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update multiple leave types
const updateLeaveTypes = asyncHandler(async (req, res) => {
  try {
    const { leaveTypes } = req.body;
    const { workspaceId } = req.params;

      // Check for existing names
      const existingNames = await prisma.leaveType.findMany({
        where: {
          workspaceId,
          name: { in: leaveTypes.map((lt) => lt.name) },
        },
      });
  
      if (existingNames.length > 0) {
        return res.status(400).json({
          error: `Leave types with names (${existingNames.map((index) => index.name).join(', ')}) already exist`,
        });
      }
    const updatedLeaveTypes = await Promise.all(
      leaveTypes.map(async (leaveType) => {
        const existingLeaveType = await prisma.leaveType.findUnique({
          where: { id: leaveType.id },
        });

        if (!existingLeaveType) {
          return null;
        }

        return prisma.leaveType.update({
          where: { id: leaveType.id },
          data: {
            name: leaveType.name,
          },

          select: { id: true, name: true },
        });
      })
    );
   
    res
      .status(200)
      .json({
        updatedLeaveTypes: updatedLeaveTypes.filter(Boolean)
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete multiple leave types
const deleteLeaveTypes = asyncHandler(async (req, res) => {
  try {
    const { leaveTypeIds } = req.body;
    await prisma.leaveType.deleteMany({
      where: { id: { in: leaveTypeIds } },
    });

    res.status(204).json(`Leave types deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createLeaveTypes,
  getAllLeaveTypes,
  getLeaveTypeById,
  updateLeaveTypes,
  deleteLeaveTypes,
};
