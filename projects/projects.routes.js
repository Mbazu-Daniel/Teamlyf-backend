import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
} from "./projects.controllers.js";

import { checkWorkspaceExists } from "../workspaces/workspaces.middleware.js";

// const projectRouter = express.Router();
const projectRouter = express.Router({ mergeParams: true });

projectRouter.use("/:workspaceId", checkWorkspaceExists);

projectRouter.post(
  "/:workspaceId/spaces/:spaceId/projects",
  verifyToken,
  createProject
);
projectRouter.get("/:workspaceId/spaces/:spaceId/projects", getAllProjects);
projectRouter.get("/:workspaceId/spaces/:spaceId/projects/:id", getProjectById);
projectRouter.patch(
  "/:workspaceId/spaces/:spaceId/projects/:id",
  updateProject
);
projectRouter.delete(
  "/:workspaceId/spaces/:spaceId/projects/:id",
  deleteProject
);

export default projectRouter;
