import express from "express";
import {
  createMilestone,
  getAllMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  getAllProjectsInMilestone,
  addProjectsToMilestone,
} from "./milestones.controllers.js";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";

const app = express();
const milestoneRouter = express.Router();

app.use(
  "/workspace",
  milestoneRouter

  /* 
  
  #swagger.tags = ['Milestones']
  */
);

milestoneRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

milestoneRouter.post("/:workspaceId/milestones", createMilestone);

milestoneRouter.get("/:workspaceId/milestones", getAllMilestones);

milestoneRouter.get("/:workspaceId/milestones/:milestoneId", getMilestoneById);

milestoneRouter.patch("/:workspaceId/milestones/:milestoneId", updateMilestone);

milestoneRouter.delete(
  "/:workspaceId/milestones/:milestoneId",
  deleteMilestone
);

milestoneRouter.get(
  "/:workspaceId/milestones/:milestoneId/projects",
  getAllProjectsInMilestone
);

milestoneRouter.post(
  "/:workspaceId/milestones/:milestoneId/projects",
  addProjectsToMilestone
);
export default milestoneRouter;
