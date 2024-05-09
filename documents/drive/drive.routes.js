import {
  getStarredFoldersAndFiles,
  markAsStarred,
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

export default driveRouter;
