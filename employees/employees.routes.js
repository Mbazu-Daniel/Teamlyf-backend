import express from "express";
import {
  getAllEmployeesByOrganization,
  getEmployeeByIdByOrganization,
  updateEmployeeByOrganization,
  deleteEmployeeByOrganization,
} from "./employees.controllers.js";

const employeeRouter = express.Router();

// Routes for managing employees within an organization
employeeRouter.get("/:organizationId/employees", getAllEmployeesByOrganization);
employeeRouter.get(
  "/:organizationId/employees/:employeeId",
  getEmployeeByIdByOrganization
);
employeeRouter.put(
  "/:organizationId/employees/:employeeId",
  updateEmployeeByOrganization
);
employeeRouter.delete(
  "/:organizationId/employees/:employeeId",
  deleteEmployeeByOrganization
);

export default employeeRouter;
