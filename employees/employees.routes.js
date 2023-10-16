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

import { checkOrganizationExists } from "../organizations/organizations.middleware.js";

employeeRouter.use("/:orgId", verifyToken, checkOrganizationExists);

// Routes for managing employees within an organization

employeeRouter.get("/:orgId/employees/search", searchEmployees);

employeeRouter.get("/:orgId/employees/", getEmployeeByEmail);

employeeRouter.get("/:orgId/employees/count", getEmployeesCount);

employeeRouter.get("/:orgId/employees", getAllEmployees);
employeeRouter.get("/:orgId/employees/:employeeId", getEmployeeById);
employeeRouter.get("/:orgId/employees/", getEmployeeByEmail);
employeeRouter.patch("/:orgId/employees/:employeeId", updateEmployee);
employeeRouter.delete("/:orgId/employees/:employeeId", deleteEmployee);

employeeRouter.get("/:orgId/employees/:employeeId/teams", getTeamsByEmployee);
employeeRouter.patch(
  "/:orgId/employees/:employeeId/change-role",
  changeEmployeeRole
);

export default employeeRouter;
