import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import { allEmployeeRoles, getCurrentWorkspace } from "../middleware/index.js";
import upload from "../services/multerConfig.js";

import {
  calculateTotalFileSizeInWorkspace,
  createTaskFile,
  deleteTaskFile,
  getAllFiles,
  getTaskFiles,
  shareTaskFile,
  updateTaskFile,
} from "./tasksFile.controllers.js";

const taskFileRouter = express.Router({ mergeParams: true });

taskFileRouter.use(
  "/:workspaceId",
  verifyToken,
  allEmployeeRoles,
  getCurrentWorkspace
);

// Get all space related tasks
taskFileRouter.post(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/files",
  upload.single("file"),
  createTaskFile
);
taskFileRouter.get(
  "/:workspaceId/spaces/:spaceId/tasks/:taskId/files",
  getTaskFiles
);

taskFileRouter.get("/:workspaceId/files/", getAllFiles);
taskFileRouter.patch("/:workspaceId/files/:fileId", updateTaskFile);
taskFileRouter.delete("/:workspaceId/files/:fileId", deleteTaskFile);
taskFileRouter.post("/:workspaceId/files/fileId", shareTaskFile);
taskFileRouter.get(
  "/:workspaceId/files/calculate-file-size",
  calculateTotalFileSizeInWorkspace
);
export default taskFileRouter;
