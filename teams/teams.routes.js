import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  deleteTeam,
  updateTeam,
  addEmployeeToTeam,
  removeEmployeeFromTeam,
  getTeamEmployees,
} from "./teams.controllers.js";

import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";
import { checkOrganizationExists } from "../organizations/organizations.middleware.js";

const teamsRouter = express.Router({ mergeParams: true });

teamsRouter.use("/:orgId", verifyToken, checkOrganizationExists);

teamsRouter.post("/:orgId/teams/:teamId/add-employee", addEmployeeToTeam);
teamsRouter.post(
  "/:orgId/teams/:teamId/remove-employee",
  removeEmployeeFromTeam
);
teamsRouter.get("/:orgId/teams/:teamId/employees", getTeamEmployees);

teamsRouter.post("/:orgId/teams", createTeam);
teamsRouter.get("/:orgId/teams", getAllTeams);
teamsRouter.get("/:orgId/teams/:teamId", getTeamById);
teamsRouter.patch("/:orgId/teams/:teamId", updateTeam);
teamsRouter.delete("/:orgId/teams/:teamId", deleteTeam);

export default teamsRouter;
