
import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJobDetails,
  updateJobStatus,
  deleteJob,
} from "./jobs.controllers.js";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";

const app = express();
const jobsRouter = express.Router();

app.use("/workspace", jobsRouter


	/* 
  
  #swagger.tags = ['Jobs']
  */
);



jobsRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);


jobsRouter.post(
  "/:workspaceId/jobs",
  createJob
);

jobsRouter.get(
  "/:workspaceId/jobs",
  getAllJobs
);


jobsRouter.get(
  "/:workspaceId/jobs/:jobId",
  getJobById
);

jobsRouter.patch("/:workspaceId/jobs/:jobId", updateJobDetails);
jobsRouter.patch("/:workspaceId/jobs/:jobId/status", updateJobStatus);

jobsRouter.delete(
  "/:workspaceId/jobs/:jobId",
  deleteJob
);



export default jobsRouter;