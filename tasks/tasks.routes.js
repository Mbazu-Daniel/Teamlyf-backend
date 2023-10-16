import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  deleteTask,
  updateTask,
} from "./tasks.controllers.js";
import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";

import { checkOrganizationExists } from "../organizations/organizations.middleware.js";

// const taskRouter = express.Router();
const taskRouter = express.Router({ mergeParams: true });

taskRouter.use("/:orgId", checkOrganizationExists);

taskRouter.post(
  "/:orgId/folders/:folderId/tasks",
  verifyToken,
  createTask
);
taskRouter.get("/:orgId/folders/:folderId/tasks", getAllTasks);
taskRouter.get("/:orgId/folders/:folderId/tasks/:id", getTaskById);
taskRouter.patch("/:orgId/folders/:folderId/tasks/:id", updateTask);
taskRouter.delete("/:orgId/folders/:folderId/tasks/:id", deleteTask);

export default taskRouter;
