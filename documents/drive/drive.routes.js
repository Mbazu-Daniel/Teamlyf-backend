import {
  markAsStarred,
  getAllUsersFoldersAndFiles,
  getStarredFoldersAndFolders,
  shareFoldersAndFile,
} from "./drive.controllers.js";

import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentWorkspace,
  getCurrentEmployee,
} from "../../utils/middleware/index.js";
import express from "express";
const app = express();
const driveRouter = express.Router();

app.use(
  "/workspace",
  driveRouter

  //  #swagger.tags = ['Other Drive']
);

driveRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

// mark folders and files as starred
driveRouter.patch("/:workspaceId/drive/starred", markAsStarred);
// get starred folders and files
driveRouter.get("/:workspaceId/drive/starred", getStarredFoldersAndFolders);

// get all users folders and files
driveRouter.get("/:workspaceId/drive/my-drive", getAllUsersFoldersAndFiles);

// create shared link
driveRouter.post("/:workspaceId/drive/shared-files", shareFoldersAndFile);


// driveRouter.patch("/:workspaceId/drive/starred", markAsStarred);

export default driveRouter;
