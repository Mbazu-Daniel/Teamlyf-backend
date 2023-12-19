import express from "express";
import {
  createSubtask,
  deleteSubtask,
  getAllSubtasks,
  updateSubtask,
} from "./subTasks.controllers.js";

import { verifyToken } from "../../helper/middleware/authenticate.js";

import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../helper/middleware/index.js";

const subtaskRouter = express.Router({ mergeParams: true });

subtaskRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

// Get all space related tasks
subtaskRouter.post(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/subtasks",
  createSubtask
);
subtaskRouter.get(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/subtasks",
  getAllSubtasks
);
subtaskRouter.patch(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/subtasks/:id",
  updateSubtask
);
subtaskRouter.delete(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/subtasks/:id",
  deleteSubtask
);

export default subtaskRouter;
