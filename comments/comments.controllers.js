import asyncHandler from "express-async-handler";
import Comment from "./comments.models.js";
import Task from "./tasks.models.js";

// Create a new comment
const createComment = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  const employeeId = req.user._id;
  const { text } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const commentData = {
      task: taskId,
      employee: employeeId,
      text,
    };
    // create a new comment
    const comment = await Comment.create(commentData);

    // update the comment to the current task
    await Task.updateOne({ _id: taskId }, { $push: { comments: comment._id } });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Get all comments
const getAllComments = asyncHandler(async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comment by ID
const getCommentById = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  const employeeId = req.user._id;

  try {
    const comment = await Comment.findOne({
      _id: taskId,
      assignees: employeeId,
    });
    if (!comment) {
      return res.status(404).json({ message: `Comment  ${id} not found` });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update comment by ID
const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!comment) {
      return res.status(404).json({ message: `Comment  ${id} not found` });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment by ID
const deleteComment = asyncHandler(async (req, res) => {
  const { taskId, commentId } = req.params;
  try {
    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      taskId: taskId,
    });
    if (!comment) {
      return res.status(404).json({ message: `Comment  ${id} not found` });
    }
    res.status(204).json({ message: `Comment  ${id} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  createComment,
  getAllComments,
  getCommentById,
  deleteComment,
  updateComment,
};
