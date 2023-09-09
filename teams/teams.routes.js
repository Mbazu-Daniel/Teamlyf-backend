import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  deleteTeam,
  updateTeam,
  getTeamEmployees,
} from "./teams.controllers.js";

import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";

const teamsRouter = express.Router();

teamsRouter.post("/:organizationId/teams", verifyToken, createTeam);
teamsRouter.get("/:organizationId/teams", getAllTeams);
teamsRouter.get("/:organizationId/teams/:teamId", getTeamById);
teamsRouter.patch("/:organizationId/teams/:teamId", updateTeam);
teamsRouter.delete("/:organizationId/teams/:teamId", deleteTeam);
teamsRouter.get("/:organizationId/teams/:teamId/employees", getTeamEmployees);

export default teamsRouter;
