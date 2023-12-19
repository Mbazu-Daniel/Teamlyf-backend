import express from "express";
import { verifyToken } from "../../helper/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../helper/middleware/index.js";
import {
  changeEmployeeRole,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeesCount,
  getEmployeeByEmail,
  getTeamsByEmployee,
  searchEmployees,
  updateEmployee,
} from "./employees.controllers.js";

const employeeRouter = express.Router({ mergeParams: true });

employeeRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

// Routes for managing employees within an workspace

employeeRouter.get("/:workspaceId/employees/search", searchEmployees);

employeeRouter.get("/:workspaceId/employees/count", getEmployeesCount);

employeeRouter.get("/:workspaceId/employees", getAllEmployees);

employeeRouter.get("/:workspaceId/employees/", getEmployeeByEmail);

employeeRouter.get("/:workspaceId/employees/:employeeId", getEmployeeById);
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
