import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject,
  updateProject,
} from "./projects.controllers.js";
import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";

import { checkOrganizationExists } from "../organizations/organizations.middleware.js";

// const projectRouter = express.Router();
const projectRouter = express.Router({ mergeParams: true });

projectRouter.use("/:orgId", checkOrganizationExists);

projectRouter.post(
  "/:orgId/folders/:folderId/projects",
  verifyToken,
  createProject
);
projectRouter.get("/:orgId/folders/:folderId/projects", getAllProjects);
projectRouter.get("/:orgId/folders/:folderId/projects/:id", getProjectById);
projectRouter.patch("/:orgId/folders/:folderId/projects/:id", updateProject);
projectRouter.delete("/:orgId/folders/:folderId/projects/:id", deleteProject);

export default projectRouter;
