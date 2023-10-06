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

employeeRouter.use("/:organizationId", checkOrganizationExists);

// Routes for managing employees within an organization

employeeRouter.get("/:organizationId/employees/search", searchEmployees);

employeeRouter.get("/:organizationId/employees/count", getEmployeesCount);

employeeRouter.get("/:organizationId/employees", getAllEmployees);
employeeRouter.get("/:organizationId/employees/:employeeId", getEmployeeById);
employeeRouter.patch("/:organizationId/employees/:employeeId", updateEmployee);
employeeRouter.delete("/:organizationId/employees/:employeeId", deleteEmployee);

employeeRouter.get(
  "/:organizationId/employees/:employeeId/teams",
  getTeamsByEmployee
);
employeeRouter.patch(
  "/:organizationId/employees/:employeeId/change-role",
  changeEmployeeRole
);

export default employeeRouter;
