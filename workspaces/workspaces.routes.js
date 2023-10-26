import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  getWorkspaceOwners,
  transferWorkspaceOwnership
} from "./workspaces.controllers.js";
const workspacesRouter = express.Router({ mergeParams: true });

workspacesRouter.use("/", verifyToken);

workspacesRouter.post("/", createWorkspace);
workspacesRouter.get("/", getAllWorkspaces);
workspacesRouter.get('/workspace-owners', getWorkspaceOwners);
workspacesRouter.get("/:id", getWorkspaceById);
workspacesRouter.patch("/:id", updateWorkspace);
workspacesRouter.delete("/:id", deleteWorkspace);  

export default workspacesRouter;
