import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../middleware/index.js";
import { generateInviteLink, joinWorkspace } from "./invites.controllers.js";

const inviteRouter = express.Router({ mergeParams: true });

inviteRouter.use("/:workspaceId", verifyToken);

inviteRouter.post(
  "/:workspaceId/generate-invite-link",
  getCurrentWorkspace,
  getCurrentEmployee,
  generateInviteLink
);
inviteRouter.post("/join/:inviteToken", joinWorkspace);

export default inviteRouter;
