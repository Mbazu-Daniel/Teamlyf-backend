import express from "express";
import {
  createFolder,
  getAllFolders,
  getFolderById,
  deleteFolder,
  updateFolder,
} from "./folders.controllers.js";
import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";
import { checkOrganizationExists } from "../organizations/organizations.middleware.js";

// const folderRouter = express.Router();
const folderRouter = express.Router({ mergeParams: true });

folderRouter.use("/:orgId", checkOrganizationExists);

folderRouter.post("/:orgId/folders", verifyToken, createFolder);
folderRouter.get("/:orgId/folders", getAllFolders);
folderRouter.get("/:orgId/folders/:id", getFolderById);
folderRouter.patch("/:orgId/folders/:id", updateFolder);
folderRouter.delete("/:orgId/folders/:id", deleteFolder);

export default folderRouter;
