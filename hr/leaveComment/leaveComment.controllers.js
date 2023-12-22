import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create leave comment
const createLeaveComment = asyncHandler(async (req, res) => {
  try {
    const { workspaceId,leaveId } = req.params;
    const employeeId = req.employeeId;
    const { comments } = req.body;

    const leaveComment = await prisma.leaveComment.create({
      data: {
        comments,
        leave: {connect:{id: leaveId}},
        employee: {connect:{id: employeeId}},
        workspace: {connect:{id: workspaceId}},
      },
    });

    res.status(201).json(leaveComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all leave comments in workspace
const getAllLeaveComments = asyncHandler(async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const leaveComments = await prisma.leaveComment.findMany({
      where: {
        workspaceId,
      },
    });

    res.status(200).json(leaveComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get leave comment by ID
const getLeaveCommentById = asyncHandler(async (req, res) => {
  try {
    const { leaveCommentId } = req.params;
    const leaveComment = await prisma.leaveComment.findUnique({
      where: { id: leaveCommentId },
    });

    if (!leaveComment) {
      return res
        .status(404)
        .json({ error: `Leave comment ${leaveCommentId} not found` });
    }

    res.status(200).json(leaveComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update leave comment by ID
const updateLeaveComment = asyncHandler(async (req, res) => {
  try {
    const { leaveCommentId } = req.params;
    const { comments } = req.body;

    const updatedLeaveComment = await prisma.leaveComment.update({
      where: { id: leaveCommentId },
      data: { comments },
    });

    res.status(200).json(updatedLeaveComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete leave comment by ID
const deleteLeaveComment = asyncHandler(async (req, res) => {
  try {
    const { leaveCommentId } = req.params;

    await prisma.leaveComment.delete({
      where: { id: leaveCommentId },
    });

    res.status(204).json(`Leave comment ${leaveCommentId} deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createLeaveComment,
  getAllLeaveComments,
  getLeaveCommentById,
  updateLeaveComment,
  deleteLeaveComment,
};
