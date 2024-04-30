import express from "express";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  allEmployeeRoles,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";
import { fileUpload } from "../../utils/services/awsS3bucket.js";
import {
  uploadFileToCloud,
  getFileDetails,
  getUserFiles,
  updateFileDetails,
} from "./files.controllers.js";

const fileRouter = express.Router();

const app = express();

app.use(
  "/workspace",
  fileRouter

  // #swagger.tags = ['Files ']
);

fileRouter.use(
  "/:workspaceId",
  verifyToken,
  allEmployeeRoles,
  getCurrentWorkspace
);

// Upload a file (single and multiple)
fileRouter.post(
  "/:workspaceId/file",
  fileUpload.array("file"),
  uploadFileToCloud
);

// TODO: Move to employee endpoint
// Get User's Files
fileRouter.get("/:workspaceId/file/user", getUserFiles);

// Get File details
fileRouter.get("/:workspaceId/file/:fileId", getFileDetails);

// update File details
fileRouter.patch("/:workspaceId/file/:fileId", updateFileDetails);

export default fileRouter;
