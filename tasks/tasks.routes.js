import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
} from "./tasks.controllers.js";
import {
  createTaskSpace,
  deleteTaskSpace,
  getAllTasksSpace,
  getTaskByIdSpace,
  updateTaskSpace,
} from "./tasksSpace.controllers.js";

import { checkWorkspaceExists } from "../workspaces/workspaces.middleware.js";

// const taskRouter = express.Router();
const taskRouter = express.Router({ mergeParams: true });

taskRouter.use("/:workspaceId", verifyToken, checkWorkspaceExists);

// Get tasks
taskRouter.post("/:workspaceId/tasks", createTask);
taskRouter.get("/:workspaceId/tasks", getAllTasks);
taskRouter.get("/:workspaceId/tasks/:id", getTaskById);
taskRouter.patch("/:workspaceId/tasks/:id", updateTask);
taskRouter.delete("/:workspaceId/tasks/:id", deleteTask);

// Get all space related tasks
taskRouter.post("/:workspaceId/spaces/:spaceId/tasks", createTaskSpace);
taskRouter.get("/:workspaceId/spaces/:spaceId/tasks", getAllTasksSpace);
taskRouter.get("/:workspaceId/spaces/:spaceId/tasks/:id", getTaskByIdSpace);
taskRouter.patch("/:workspaceId/spaces/:spaceId/tasks/:id", updateTaskSpace);
taskRouter.delete("/:workspaceId/spaces/:spaceId/tasks/:id", deleteTaskSpace);

export default taskRouter;
