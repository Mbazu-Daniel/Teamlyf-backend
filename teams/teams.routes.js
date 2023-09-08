import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamMembers,
  deleteTeam,
  updateTeam,
} from "./teams.controllers.js";

import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";

const teamsRouter = express.Router();

teamsRouter.post("/:organizationId/teams", verifyToken, createTeam);
teamsRouter.get("/:organizationId/teams", getAllTeams);
teamsRouter.get("/:organizationId/teams/:teamId/members", getTeamMembers);
teamsRouter.patch("/:organizationId/teams/:teamId", updateTeam);
teamsRouter.delete("/:organizationId/teams/:teamId", deleteTeam);

export default teamsRouter;
