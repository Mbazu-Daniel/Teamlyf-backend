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

teamsRouter.use("/:organizationId", verifyToken, checkOrganizationExists);

teamsRouter.post(
  "/:organizationId/teams/:teamId/add-employee",
  addEmployeeToTeam
);
teamsRouter.post(
  "/:organizationId/teams/:teamId/remove-employee",
  removeEmployeeFromTeam
);
teamsRouter.get("/:organizationId/teams/:teamId/employees", getTeamEmployees);

teamsRouter.post("/:organizationId/teams", createTeam);
teamsRouter.get("/:organizationId/teams", getAllTeams);
teamsRouter.get("/:organizationId/teams/:teamId", getTeamById);
teamsRouter.patch("/:organizationId/teams/:teamId", updateTeam);
teamsRouter.delete("/:organizationId/teams/:teamId", deleteTeam);

export default teamsRouter;
