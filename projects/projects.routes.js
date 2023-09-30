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
projectRouter.get("/:projectId", getProjectById);
projectRouter.patch("/:projectId", updateProject);
projectRouter.delete("/:projectId", deleteProject);

export default projectRouter;
