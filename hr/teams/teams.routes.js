import express from "express";
import {
  addEmployeesToTeam,
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  getEmployeesInTeam,
  removeEmployeesFromTeam,
  updateTeam,
  updateTeamDetails,
  updateEmployeeRoles
} from "./teams.controllers.js";
import { verifyToken } from "../../helper/middleware/authenticate.js";
import {
  getCurrentWorkspace,
  getCurrentEmployee,
  checkTeamExists,
} from "../../helper/middleware/index.js";;

const teamsRouter = express.Router({ mergeParams: true });

teamsRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

teamsRouter.use("/:workspaceId", getCurrentEmployee, getCurrentWorkspace);
teamsRouter.post("/:workspaceId/teams", createTeam);
teamsRouter.get("/:workspaceId/teams", getAllTeams);
teamsRouter.get("/:workspaceId/teams/:teamId", getTeamById);
teamsRouter.patch(
  "/:workspaceId/teams/:teamId/details",
  checkTeamExists,
  updateTeamDetails
);
teamsRouter.patch(
  "/:workspaceId/teams/:teamId/roles",
  checkTeamExists,
  updateEmployeeRoles
);
teamsRouter.delete("/:workspaceId/teams/:teamId", checkTeamExists, deleteTeam);
teamsRouter.post(
  "/:workspaceId/teams/:teamId/add-employee",
  checkTeamExists,
  addEmployeesToTeam
);
teamsRouter.delete(
  "/:workspaceId/teams/:teamId/remove-employee",
  checkTeamExists,
  removeEmployeesFromTeam
);
teamsRouter.get(
  "/:workspaceId/teams/:teamId/employees",
  checkTeamExists,
  getEmployeesInTeam
);

export default teamsRouter;
