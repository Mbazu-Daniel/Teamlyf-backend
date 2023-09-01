import express from "express";
import {
  createSpace,
  getAllSpaces,
  getSpaceById,
  deleteSpace,
  updateSpace,
} from "./spaces.controllers.js";

const spaceRouter = express.Router();

spaceRouter.post("/", createSpace);
spaceRouter.get("/", getAllSpaces);
spaceRouter.get("/:id", getSpaceById);
spaceRouter.patch("/:id", updateSpace);
spaceRouter.delete("/:id", deleteSpace);

export default spaceRouter;
