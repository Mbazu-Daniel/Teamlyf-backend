import express from "express";
import {
  getAllEmployeesByOrganization,
  getEmployeeByIdByOrganization,
  updateEmployeeByOrganization,
  deleteEmployeeByOrganization,
  addEmployeeToTeam,
  removeEmployeeFromTeam,
} from "./employees.controllers.js";

const employeeRouter = express.Router();

// Routes for managing employees within an organization
employeeRouter.get("/:organizationId/employees", getAllEmployeesByOrganization);
employeeRouter.get(
  "/:organizationId/employees/:employeeId",
  getEmployeeByIdByOrganization
);
employeeRouter.patch(
  "/:organizationId/employees/:employeeId",
  updateEmployeeByOrganization
);
employeeRouter.delete(
  "/:organizationId/employees/:employeeId",
  deleteEmployeeByOrganization
);

employeeRouter.post(
  "/:organizationId/teams/:teamId/add-member",
  addEmployeeToTeam
);
employeeRouter.post(
  "/:organizationId/teams/:teamId/remove-member",
  removeEmployeeFromTeam
);

export default employeeRouter;
