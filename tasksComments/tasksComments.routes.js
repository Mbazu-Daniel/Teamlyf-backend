import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../middleware/index.js";

import {
  createTaskComment,
  getTaskComments,
  deleteTaskComment,
  updateTaskComment,
} from "./tasksComments.controllers.js";

const taskCommentRouter = express.Router({ mergeParams: true });

taskCommentRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

// Get all space related tasks
taskCommentRouter.post(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/comments",
  createTaskComment
);
taskCommentRouter.get("/:workspaceId/spaces/:spaceId/tasks/:taskId/comments", getTaskComments);
taskCommentRouter.patch(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/comments/:id",
  updateTaskComment
);
taskCommentRouter.delete(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/comments/:id",
  deleteTaskComment
);
export default taskCommentRouter;
