import express from "express";
import { verifyToken } from "../../helper/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../helper/middleware/index.js";;

import {
  createTaskSpace,
  deleteTaskSpace,
  getAllTasksSpace,
  getTaskByIdSpace,
  updateTaskSpace,
  getAllTasksInWorkspace,
  getTaskCountInWorkspace,
  addCollaboratorsToTask,
  removeCollaboratorsFromTask
} from "./tasks.controllers.js";
// const taskRouter = express.Router();
const taskRouter = express.Router({ mergeParams: true });

taskRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

taskRouter.get("/:workspaceId/tasks", getAllTasksInWorkspace);

// Get task count in the workspace
taskRouter.get("/:workspaceId/tasks-count", getTaskCountInWorkspace);

// Get all space related tasks
taskRouter.post("/:workspaceId/spaces/:spaceId/tasks", createTaskSpace);
taskRouter.get("/:workspaceId/spaces/:spaceId/tasks", getAllTasksSpace);
taskRouter.get("/:workspaceId/spaces/:spaceId/tasks/:id", getTaskByIdSpace);
taskRouter.patch("/:workspaceId/spaces/:spaceId/tasks/:id", updateTaskSpace);
taskRouter.delete("/:workspaceId/spaces/:spaceId/tasks/:id", deleteTaskSpace);



taskRouter.post(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/add-collaborators",
  addCollaboratorsToTask
);
taskRouter.post(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/remove-collaborators",
  removeCollaboratorsFromTask
);
export default taskRouter;
