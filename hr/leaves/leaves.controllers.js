import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

const leaveSelectOptions = {
  id: true,
  appliedDate: true,
  startDate: true,
  endDate: true,
  duration: true,
  reason: true,
  status: true,
  leaveResponseBy: true,
  leaveType: { select: { name: true } },
  employee: { select: { fullName: true } },
};

// Create a new leave request
const createLeave = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const employeeId = req.employeeId;
    let { startDate, endDate, duration, reason, leaveTypeId } = req.body;

    startDate = new Date(startDate);
    endDate = new Date(endDate);
    duration = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const leave = await prisma.leave.create({
      data: {
        startDate,
        endDate,
        duration,
        reason: reason,
        leaveType: { connect: { id: leaveTypeId } },
        employee: { connect: { id: employeeId } },
        workspace: { connect: { id: workspaceId } },
      },
    });

    res.status(201).json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// Get all leave requests in workspace
const getAllWorkspaceLeaves = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const leaves = await prisma.leave.findMany({
      where: { workspaceId },
      select: leaveSelectOptions,
      orderBy: [{ id: "desc" }],
    });

    res.status(200).json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all leave requests for an employee
const getEmployeeLeaves = asyncHandler(async (req, res) => {
  try {
    const employeeId = req.employeeId;

    const leaves = await prisma.leave.findMany({
      where: { employeeId },
      select: leaveSelectOptions,
      orderBy: [{ id: "desc" }],
    });

    res.status(200).json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get leave request by ID
const getLeaveById = asyncHandler(async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      select: leaveSelectOptions,
    });

    if (!leave) {
      return res.status(404).json({ message: `Leave request ${id} not found` });
    }

    res.status(200).json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update leave request by ID
const updateLeave = asyncHandler(async (req, res) => {
  try {
    const { leaveId } = req.params;
    let { startDate, endDate, duration, reason, leaveTypeId } = req.body;
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    duration = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
     const leave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        startDate,
        endDate,
        duration,
        reason: reason,
        leaveType: { connect: { id: leaveTypeId } },
      },
      select: leaveSelectOptions,
    });

    if (!leave) {
      return res.status(404).json({ message: `Leave request ${id} not found` });
    }

    res.status(200).json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete leave request by ID
const deleteLeave = asyncHandler(async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await prisma.leave.delete({
      where: { id: leaveId },
    });

    if (!leave) {
      return res.status(404).json({ message: `Leave request ${id} not found` });
    }

    res.status(204).json(`Leave request ${id} deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const updateLeaveStatus = asyncHandler(async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { leaveId } = req.params;
    const { status } = req.body;

       // Fetch the current leave request
       const currentLeave = await prisma.leave.findUnique({
        where: { id: leaveId },
      });
  
      if (!currentLeave) {
        return res.status(404).json({ message: `Leave request ${leaveId} not found` });
      }
  

    const leave = await prisma.leave.update({
      where: { id: leaveId },
      data: { status, leaveResponseBy: employeeId},
      select: leaveSelectOptions,
    });

    await prisma.leaveHistory.create({
      data: {
        leaveId,
        oldStatus: currentLeave.status,
        updatedDate: new Date(),
        updatedStatus: status,
        updatedBy: employeeId

      }
    })

    res.status(200).json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
export {
  createLeave,
  getAllWorkspaceLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
  getEmployeeLeaves,
  updateLeaveStatus,
};
