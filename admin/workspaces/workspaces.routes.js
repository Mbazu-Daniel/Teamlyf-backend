import express from "express";
import {
  verifyToken,
  verifyLogin,
} from "../../utils/middleware/authenticate.js";
import {
  createWorkspace,
  deleteWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  getWorkspaceOwners,
  transferWorkspaceOwnership,
  leaveWorkspace,
  changeWorkspaceInviteCode,
  getTotalWorkspacesCount,
  joinWorkspaceUsingInviteCode,
  getAllWorkspaces,
} from "./workspaces.controllers.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";
import {
  validateCreateWorkspace,
  validateJoinWorkspace,
  validateUpdateWorkspace,
} from "./workspaces.validate.js";

const app = express();
const workspacesRouter = express.Router();

app.use(
  "/workspace",
  workspacesRouter
  /* 
  
  #swagger.tags = ['Workspace']
  */
);

workspacesRouter.use(verifyLogin);

workspacesRouter.post("/", validateCreateWorkspace, createWorkspace);
workspacesRouter.get("/", getAllWorkspaces);
workspacesRouter.get("/current-user", getUserWorkspaces);
workspacesRouter.get(
  "/count",
  getCurrentWorkspace,
  getCurrentEmployee,
  getTotalWorkspacesCount
);
workspacesRouter.get(
  "/:workspaceId",

  getCurrentEmployee,
  getCurrentWorkspace,
  getWorkspaceById
);
workspacesRouter.patch(
  "/:workspaceId",
  getCurrentWorkspace,
  getCurrentEmployee,
  validateUpdateWorkspace,
  updateWorkspace
);
workspacesRouter.delete(
  "/:workspaceId",
  getCurrentWorkspace,
  getCurrentEmployee,
  deleteWorkspace
);
workspacesRouter.post(
  "/:workspaceId/transfer-owner",
  getCurrentWorkspace,
  getCurrentEmployee,
  transferWorkspaceOwnership
);
workspacesRouter.post(
  "/:workspaceId/leave-workspace",
  getCurrentWorkspace,
  getCurrentEmployee,
  leaveWorkspace
);
workspacesRouter.get(
  "/workspace-owners",
  getCurrentEmployee,
  getWorkspaceOwners
);

workspacesRouter.patch(
  "/:workspaceId/change-invite-code",
  getCurrentEmployee,
  changeWorkspaceInviteCode
);
workspacesRouter.post(
  "/:workspaceId/join-with-invite-code",
  getCurrentEmployee,
  validateJoinWorkspace,
  joinWorkspaceUsingInviteCode
);

export default workspacesRouter;
