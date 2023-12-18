import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  getWorkspaceOwners,
  transferWorkspaceOwnership,
  leaveWorkspace
} from "./workspaces.controllers.js";
const workspacesRouter = express.Router({ mergeParams: true });
 

workspacesRouter.use("/", verifyToken);

workspacesRouter.post("/", createWorkspace);
workspacesRouter.get("/", getAllWorkspaces);
workspacesRouter.get("/:id", getWorkspaceById);
workspacesRouter.patch("/:id", updateWorkspace);
workspacesRouter.delete("/:id", deleteWorkspace); 
workspacesRouter.post("/transfer-owner/:id", transferWorkspaceOwnership); 
workspacesRouter.post("/leave-workspace/:id", leaveWorkspace); 
workspacesRouter.get('/workspace-owners', getWorkspaceOwners);


export default workspacesRouter;
