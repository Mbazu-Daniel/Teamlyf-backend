import express from "express";
import {
  addEmployeeToTeam,
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  getTeamEmployees,
  removeEmployeeFromTeam,
  updateTeam,
  updateTeamDetails,
  updateEmployeeRoles
} from "./teams.controllers.js";
import { verifyToken } from "../middleware/authenticate.js";
import {
  getCurrentWorkspace,
  getCurrentEmployee,
  checkTeamExists,
} from "../middleware/index.js";

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
  addEmployeeToTeam
);
teamsRouter.post(
  "/:workspaceId/teams/:teamId/remove-employee",
  checkTeamExists,
  removeEmployeeFromTeam
);
teamsRouter.get(
  "/:workspaceId/teams/:teamId/employees",
  checkTeamExists,
  getTeamEmployees
);

export default teamsRouter;
