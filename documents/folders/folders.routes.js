// FolderRoutes.js

import express from "express";
import {
  createFolder,
  getAllFolders,
  getSingleFolder,
  updateFolderDetails,
  moveFoldersAndFiles,
  getStarredFolders,
} from "./folders.controllers.js";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentWorkspace,
  getCurrentEmployee,
} from "../../utils/middleware/index.js";

const app = express();
const folderRouter = express.Router();

app.use(
  "/workspace",
  folderRouter

  //  #swagger.tags = ['Folder']
);

folderRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

// Create a new folder
folderRouter.post("/:workspaceId/drive/folders", createFolder);

// Get all folders in a workspace
folderRouter.get("/:workspaceId/drive/folders", getAllFolders);

// move folder and files to a folder in the workspace
folderRouter.post("/:workspaceId/drive/folders/move/", moveFoldersAndFiles);

// Retrieve starred folder
folderRouter.post("/:workspaceId/drive/folders/starred/", getStarredFolders);

folderRouter.get("/:workspaceId/drive/folders/:folderId", getSingleFolder);

// Update a folder by ID
folderRouter.patch(
  "/:workspaceId/drive/folders/:folderId",
  updateFolderDetails
);

export default folderRouter;
