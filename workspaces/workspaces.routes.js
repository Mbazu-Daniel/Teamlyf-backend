import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  createWorkspace,
  deleteWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  getWorkspaceOwners,
  transferWorkspaceOwnership,
  leaveWorkspace,
} from "./workspaces.controllers.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../middleware/index.js";
const workspacesRouter = express.Router({ mergeParams: true });

workspacesRouter.use("/", verifyToken);

workspacesRouter.post("/", createWorkspace);
workspacesRouter.get("/", getCurrentEmployee, getUserWorkspaces);
workspacesRouter.get(
  "/:workspaceId",

  getCurrentEmployee,
  getWorkspaceById
);
workspacesRouter.patch(
  "/:workspaceId",
  getCurrentWorkspace,
  getCurrentEmployee,
  updateWorkspace
);
workspacesRouter.delete(
  "/:workspaceId",
  getCurrentWorkspace,
  getCurrentEmployee,
  deleteWorkspace
);
workspacesRouter.post(
  "/transfer-owner/:workspaceId",
  getCurrentWorkspace,
  getCurrentEmployee,
  transferWorkspaceOwnership
);
workspacesRouter.post(
  "/leave-workspace/:workspaceId",
  getCurrentWorkspace,
  getCurrentEmployee,
  leaveWorkspace
);
workspacesRouter.get(
  "/workspace-owners",
  getCurrentEmployee,
  getWorkspaceOwners
);

export default workspacesRouter;
