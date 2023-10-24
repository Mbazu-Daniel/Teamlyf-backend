import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
  getAllTasksInProject,
  getSingleTaskInProject
} from "./projects.controllers.js";

import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../middleware/index.js";

// const projectRouter = express.Router();
const projectRouter = express.Router({ mergeParams: true });

projectRouter.use("/:workspaceId", getCurrentEmployee, getCurrentWorkspace);

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

projectRouter.get('/:workspaceId/spaces/:spaceId/projects/:projectId/tasks', getAllTasksInProject);
projectRouter.get('/:workspaceId/spaces/:spaceId/projects/:projectId/tasks/:taskId', getSingleTaskInProject);
export default projectRouter;
