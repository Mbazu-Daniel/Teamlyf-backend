import express from "express";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  allEmployeeRoles,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";
import upload from "../../utils/services/multerConfig.js";

import { createFile } from "./files.controllers.js";

const fileRouter = express.Router();

const app = express();

app.use(
  "/workspace",
  fileRouter

  // #swagger.tags = ['Tasks Files']
);

fileRouter.use(
  "/:workspaceId",
  verifyToken,
  allEmployeeRoles,
  getCurrentWorkspace
);

// Upload a file (single and multiple)
fileRouter.post("/:workspaceId/file", upload.array("file"), createFile);

// Get File details routes
fileRouter.get("/:workspaceId/file/:fileId", getFileDetails);

// TODO: move this to employee controllers
// Get User's Files
fileRouter.get("/:workspaceId/user-files", getUserFiles);

export default fileRouter;
