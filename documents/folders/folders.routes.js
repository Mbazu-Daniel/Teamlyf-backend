// FolderRoutes.js

import express from "express";
import {
  createFolder,
  getAllFolders,
  getSingleFolder,
  updateFolder,
  deleteFolder,
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
folderRouter.post("/:workspaceId/folders", createFolder);

// Get all folders in a workspace
folderRouter.get("/:workspaceId/folders", getAllFolders);

folderRouter.get("/:workspaceId/folders/:folderId", getSingleFolder);

// Update a folder by ID
folderRouter.put("/:workspaceId/folders/:folderId", updateFolder);

// Delete a folder by ID
folderRouter.delete("/:workspaceId/folders/:folderId", deleteFolder);

export default folderRouter;
