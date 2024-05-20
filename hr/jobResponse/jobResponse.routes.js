import express from "express";
import {
  createJobResponse,
  getAllJobResponses,
  getJobResponseById,
  updateJobResponse,
  deleteJobResponse,
} from "./jobResponse.controllers.js";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";

const app = express();
const jobResponsesRouter = express.Router();

app.use(
  "/workspace",
  jobResponsesRouter

  /* 
  
  #swagger.tags = ['Job Response']
  */
);

jobResponsesRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

// Route to create a new job response
jobResponsesRouter.post("/:workspaceId/:jobId/responses", createJobResponse);

// Route to get all job responses for a specific job
jobResponsesRouter.get("/:workspaceId/:jobId/responses", getAllJobResponses);

// Route to get a specific job response by ID
jobResponsesRouter.get(
  "/:workspaceId/:jobId/responses/:responseId",
  getJobResponseById
);

// Route to update a job response
jobResponsesRouter.put(
  "/:workspaceId/:jobId/responses/:responseId",
  updateJobResponse
);

jobResponsesRouter.delete(
  "/:workspaceId/:jobId/responses/:responseId",
  deleteJobResponse
);

export default jobResponsesRouter;
