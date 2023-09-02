import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject,
  updateProject,
} from "./projects.controllers.js";
import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";

const projectRouter = express.Router();

projectRouter.post("/", verifyToken, createProject);
projectRouter.get("/", getAllProjects);
projectRouter.get("/:id", getProjectById);
projectRouter.patch("/:id", updateProject);
projectRouter.delete("/:id", deleteProject);

export default projectRouter;
