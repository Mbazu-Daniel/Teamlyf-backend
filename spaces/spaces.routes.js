import express from "express";
import {
  createSpace,
  getAllSpaces,
  getSpaceById,
  deleteSpace,
  updateSpace,
} from "./spaces.controllers.js";
import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";
import { checkOrganizationExists } from "../organizations/organizations.middleware.js";

// const spaceRouter = express.Router();
const spaceRouter = express.Router({ mergeParams: true });

spaceRouter.use("/:organizationId", checkOrganizationExists);

spaceRouter.post("/:organizationId/spaces", verifyToken, createSpace);
spaceRouter.get("/:organizationId/spaces", getAllSpaces);
spaceRouter.get("/:organizationId/spaces/:id", getSpaceById);
spaceRouter.patch("/:organizationId/spaces/:id", updateSpace);
spaceRouter.delete("/:organizationId/spaces/:id", deleteSpace);

export default spaceRouter;
