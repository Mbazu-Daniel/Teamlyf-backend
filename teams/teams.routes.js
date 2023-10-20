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
} from "./teams.controllers.js";

import { verifyToken } from "../middleware/authenticate.js";
import { checkWorkspaceExists } from "../workspaces/workspaces.middleware.js";

const teamsRouter = express.Router({ mergeParams: true });

teamsRouter.use("/:workspaceId", verifyToken, checkWorkspaceExists);

teamsRouter.post("/:workspaceId/teams/:teamId/add-employee", addEmployeeToTeam);
teamsRouter.post(
  "/:workspaceId/teams/:teamId/remove-employee",
  removeEmployeeFromTeam
);
teamsRouter.get("/:workspaceId/teams/:teamId/employees", getTeamEmployees);

teamsRouter.post("/:workspaceId/teams", createTeam);
teamsRouter.get("/:workspaceId/teams", getAllTeams);
teamsRouter.get("/:workspaceId/teams/:teamId", getTeamById);
teamsRouter.patch("/:workspaceId/teams/:teamId", updateTeam);
teamsRouter.delete("/:workspaceId/teams/:teamId", deleteTeam);

export default teamsRouter;
