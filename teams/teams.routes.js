import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  deleteTeam,
  updateTeam,
} from "./teams.controllers.js";

const teamsRouter = express.Router();

teamsRouter.post("/", createTeam);
teamsRouter.get("/", getAllTeams);
teamsRouter.get("/:id", getTeamById);
teamsRouter.patch("/:id", updateTeam);
teamsRouter.delete("/:id", deleteTeam);

export default teamsRouter;
