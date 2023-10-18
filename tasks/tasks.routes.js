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
  createTaskFolder,
  deleteTaskFolder,
  getAllTasksFolder,
  getTaskByIdFolder,
  updateTaskFolder,
} from "./tasksFolder.controllers.js";

import { checkOrganizationExists } from "../organizations/organizations.middleware.js";

// const taskRouter = express.Router();
const taskRouter = express.Router({ mergeParams: true });

taskRouter.use("/:orgId", verifyToken, checkOrganizationExists);

// Get tasks
taskRouter.post("/:orgId/tasks", createTask);
taskRouter.get("/:orgId/tasks", getAllTasks);
taskRouter.get("/:orgId/tasks/:id", getTaskById);
taskRouter.patch("/:orgId/tasks/:id", updateTask);
taskRouter.delete("/:orgId/tasks/:id", deleteTask);

// Get all Folder related tasks
taskRouter.post("/:orgId/folders/:folderId/tasks", createTaskFolder);
taskRouter.get("/:orgId/folders/:folderId/tasks", getAllTasksFolder);
taskRouter.get("/:orgId/folders/:folderId/tasks/:id", getTaskByIdFolder);
taskRouter.patch("/:orgId/folders/:folderId/tasks/:id", updateTaskFolder);
taskRouter.delete("/:orgId/folders/:folderId/tasks/:id", deleteTaskFolder);

export default taskRouter;
