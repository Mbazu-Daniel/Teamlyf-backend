import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import { generateInviteLink, joinworkspace } from "./invites.controllers.js";

import { checkWorkspaceExists } from "../workspaces/workspaces.middleware.js";

const inviteRouter = express.Router({ mergeParams: true });
inviteRouter.use("/:workspaceId", verifyToken);

inviteRouter.post(
  "/:workspaceId/generate-invite-link",
  checkWorkspaceExists,
  generateInviteLink
);
inviteRouter.post("/join/:inviteToken", joinworkspace);

export default inviteRouter;
