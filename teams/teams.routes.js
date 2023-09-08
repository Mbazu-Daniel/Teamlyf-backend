import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  deleteTeam,
  updateTeam,
} from "./teams.controllers.js";

const teamsRouter = express.Router();

teamsRouter.post("/:organizationId/teams", createTeam);
teamsRouter.get("/:organizationId/teams", getAllTeams);
teamsRouter.get("/:organizationId/teams/:teamId", getTeamById);
teamsRouter.patch("/:organizationId/teams/:teamId", updateTeam);
teamsRouter.delete("/:organizationId/teams/:teamId", deleteTeam);

export default teamsRouter;
