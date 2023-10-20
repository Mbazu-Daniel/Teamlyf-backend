import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import { checkWorkspaceExists } from "../workspaces/workspaces.middleware.js";
import {
  createSpace,
  deleteSpace,
  getAllSpaces,
  getSpaceById,
  updateSpace,
} from "./spaces.controllers.js";

// const spaceRouter = express.Router();
const spaceRouter = express.Router({ mergeParams: true });

spaceRouter.use("/:workspaceId", checkWorkspaceExists);

spaceRouter.post("/:workspaceId/spaces", verifyToken, createSpace);
spaceRouter.get("/:workspaceId/spaces", getAllSpaces);
spaceRouter.get("/:workspaceId/spaces/:id", getSpaceById);
spaceRouter.patch("/:workspaceId/spaces/:id", updateSpace);
spaceRouter.delete("/:workspaceId/spaces/:id", deleteSpace);

export default spaceRouter;
