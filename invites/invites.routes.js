import express from "express";
import { generateInviteLink, joinOrganization } from "./invites.controllers.js";
import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";

import { checkOrganizationExists } from "../organizations/organizations.middleware.js";

const inviteRouter = express.Router({ mergeParams: true });
inviteRouter.use("/:orgId", verifyToken);

inviteRouter.post("/:orgId/generate-invite-link", checkOrganizationExists, generateInviteLink);
inviteRouter.post("/join/:inviteToken", joinOrganization);

export default inviteRouter;
