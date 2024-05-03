import express from "express";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  adminAndOwnerRoles,
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";
import {
  changeEmployeeRole,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeesCount,
  getEmployeeByEmail,
  getTeamsByEmployee,
  searchEmployees,
  updateEmployeeDetails,
  getCurrentEmployeeProfile,
  deactivateEmployee,
  activateEmployee,
} from "./employees.controllers.js";

const app = express();
const employeeRouter = express.Router();

app.use(
  "/workspace",
  employeeRouter
  //  #swagger.tags = ['Employees']
);

employeeRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

// Routes for managing employees within an workspace

employeeRouter.get("/:workspaceId/employees", getAllEmployees);

employeeRouter.get("/:workspaceId/employees/search", searchEmployees);

employeeRouter.get("/:workspaceId/employees/count", getEmployeesCount);

employeeRouter.get("/:workspaceId/employees/email", getEmployeeByEmail);

employeeRouter.get("/:workspaceId/employees/:employeeId", getEmployeeById);
employeeRouter.patch(
  "/:workspaceId/employees/:employeeId",
  updateEmployeeDetails
);
employeeRouter.delete("/:workspaceId/employees/:employeeId", deleteEmployee);

employeeRouter.get(
  "/:workspaceId/employees/:employeeId/teams",
  getTeamsByEmployee
);
employeeRouter.patch(
  "/:workspaceId/employees/change-role",
  adminAndOwnerRoles,
  changeEmployeeRole
);
employeeRouter.patch(
  "/:workspaceId/employees/deactivate-employee",
  adminAndOwnerRoles,
  deactivateEmployee
);
employeeRouter.patch(
  "/:workspaceId/employees/activate-employee",
  adminAndOwnerRoles,
  activateEmployee
);

employeeRouter.get("/:workspaceId/profile", getCurrentEmployeeProfile);
export default employeeRouter;
