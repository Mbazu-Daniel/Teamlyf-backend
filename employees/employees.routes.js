import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  changeEmployeeRole,
  deleteEmployee,
  getAllEmployees,
  getEmployeeByEmail,
  getEmployeeById,
  getEmployeesCount,
  getTeamsByEmployee,
  searchEmployees,
  updateEmployee,
} from "./employees.controllers.js";
const employeeRouter = express.Router({ mergeParams: true });

import { checkWorkspaceExists } from "../workspaces/workspaces.middleware.js";

employeeRouter.use("/:workspaceId", verifyToken, checkWorkspaceExists);

// Routes for managing employees within an workspace

employeeRouter.get("/:workspaceId/employees/search", searchEmployees);

employeeRouter.get("/:workspaceId/employees/", getEmployeeByEmail);

employeeRouter.get("/:workspaceId/employees/count", getEmployeesCount);

employeeRouter.get("/:workspaceId/employees", getAllEmployees);
employeeRouter.get("/:workspaceId/employees/:employeeId", getEmployeeById);
employeeRouter.get("/:workspaceId/employees/", getEmployeeByEmail);
employeeRouter.patch("/:workspaceId/employees/:employeeId", updateEmployee);
employeeRouter.delete("/:workspaceId/employees/:employeeId", deleteEmployee);

employeeRouter.get(
  "/:workspaceId/employees/:employeeId/teams",
  getTeamsByEmployee
);
employeeRouter.patch(
  "/:workspaceId/employees/:employeeId/change-role",
  changeEmployeeRole
);

export default employeeRouter;
