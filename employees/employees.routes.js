import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getTeamsByEmployee,
  changeEmployeeRole,
  searchEmployees,
  getEmployeesCount,
} from "./employees.controllers.js";

const employeeRouter = express.Router({ mergeParams: true });

import { checkOrganizationExists } from "../organizations/organizations.middleware.js";

employeeRouter.use("/:orgId", checkOrganizationExists);

// Routes for managing employees within an organization

employeeRouter.get("/:orgId/employees/search", searchEmployees);

employeeRouter.get("/:orgId/employees/count", getEmployeesCount);

employeeRouter.get("/:orgId/employees", getAllEmployees);
employeeRouter.get("/:orgId/employees/:employeeId", getEmployeeById);
employeeRouter.patch("/:orgId/employees/:employeeId", updateEmployee);
employeeRouter.delete("/:orgId/employees/:employeeId", deleteEmployee);

employeeRouter.get("/:orgId/employees/:employeeId/teams", getTeamsByEmployee);
employeeRouter.patch(
  "/:orgId/employees/:employeeId/change-role",
  changeEmployeeRole
);

export default employeeRouter;
