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
  getStarredFiles,
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
fileRouter.get("/:workspaceId/drive/file/user", getUserFiles);

// Retrieve starred files
fileRouter.post("/:workspaceId/drive/files/starred/", getStarredFiles);

// Get File details
fileRouter.get("/:workspaceId/drive/file/:fileId", getFileDetails);

// update File details
fileRouter.patch("/:workspaceId/drive/file/:fileId", updateFileDetails);

export default fileRouter;
