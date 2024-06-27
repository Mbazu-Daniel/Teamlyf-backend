import express from "express";
import {
  createEducation,
  getAllEducations,
  getEducationById,
  updateEducation,
  deleteEducation,
} from "./education.controllers.js";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";

const app = express();
const educationRouter = express.Router();

app.use("/workspace", educationRouter


	/* 
  
  #swagger.tags = ['Education']
  */
);



educationRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

educationRouter.post(
  "/:workspaceId/employees/:employeeId/educations",
  createEducation
);

educationRouter.get(
  "/:workspaceId/employees/:employeeId/educations",
  getAllEducations
);

educationRouter.get(
  "/:workspaceId/employees/:employeeId/educations/:educationId",
  getEducationById
);

educationRouter.patch(
  "/:workspaceId/employees/:employeeId/educations/:educationId",
  updateEducation
);

educationRouter.delete(
  "/:workspaceId/employees/:employeeId/educations/:educationId",
  deleteEducation
);

export default educationRouter;
