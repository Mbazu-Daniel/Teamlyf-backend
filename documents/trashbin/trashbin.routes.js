// FolderRoutes.js

import express from "express";

import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentWorkspace,
  getCurrentEmployee,
} from "../../utils/middleware/index.js";
import {
  moveFoldersAndFilesToTrash,
  restoreFoldersAndFilesFromTrash,
  deleteSelectedFoldersAndFiles,
  emptyTrashBin,
} from "./trashbin.controllers.js";

const app = express();
const trashbinRouter = express.Router();

app.use(
  "/workspace",
  trashbinRouter

  //  #swagger.tags = ['Trash Bin']
);

trashbinRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

// Route for moving folders and files to trash
trashbinRouter.patch("/:workspaceId/trash/move", moveFoldersAndFilesToTrash);

// Route for restoring folders and files from trash
trashbinRouter.patch(
  "/:workspaceId/trash/restore",
  restoreFoldersAndFilesFromTrash
);

// Route for deleting specific folders and files from trash
trashbinRouter.delete(
  "/:workspaceId/trash/delete",
  deleteSelectedFoldersAndFiles
);
// Route for restoring folders and files from trash
trashbinRouter.delete("/:workspaceId/trash/empty", emptyTrashBin);

export default trashbinRouter;
