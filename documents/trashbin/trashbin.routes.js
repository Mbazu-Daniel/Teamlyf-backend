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
  getAllTrashbins,
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

// route to return all items in trashbin
trashbinRouter.get("/:workspaceId/drive/trash", getAllTrashbins);

// Route for moving folders and files to trash
trashbinRouter.patch("/:workspaceId/drive/trash/move", moveFoldersAndFilesToTrash);

// Route for restoring folders and files from trash
trashbinRouter.patch(
  "/:workspaceId/drive/trash/restore",
  restoreFoldersAndFilesFromTrash
);

// Route for deleting specific folders and files from trash
trashbinRouter.delete(
  "/:workspaceId/drive/trash/delete",
  deleteSelectedFoldersAndFiles
);
// Route for restoring folders and files from trash
trashbinRouter.delete("/:workspaceId/drive/trash/empty", emptyTrashBin);

export default trashbinRouter;
