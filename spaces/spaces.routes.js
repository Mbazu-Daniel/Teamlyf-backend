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

const spaceRouter = express.Router();

spaceRouter.post("/", verifyToken, createSpace);
spaceRouter.get("/", getAllSpaces);
spaceRouter.get("/:id", getSpaceById);
spaceRouter.patch("/:id", updateSpace);
spaceRouter.delete("/:id", deleteSpace);

export default spaceRouter;
