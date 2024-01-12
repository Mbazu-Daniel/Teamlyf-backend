import express from "express";
import { verifyToken } from "../../helper/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../helper/middleware/index.js";
import { generateInviteLink, joinWorkspace } from "./invites.controllers.js";

const app = express();

const inviteRouter = express.Router();
app.use(
  "/invites",
  inviteRouter
  //  #swagger.tags = ['Invite']
);

inviteRouter.use("/:workspaceId", verifyToken);

inviteRouter.post(
  "/:workspaceId/generate-invite-link",
  getCurrentWorkspace,
  getCurrentEmployee,
  generateInviteLink
);
inviteRouter.post("/join/:inviteToken", joinWorkspace);

export default inviteRouter;
