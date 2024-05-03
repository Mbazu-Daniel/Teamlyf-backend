import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "./announcements.controllers.js";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";

const app = express();
const eventRouter = express.Router();

app.use(
  "/workspace",
  eventRouter

  /* 
  
  #swagger.tags = ['Events']
  */
);

eventRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

eventRouter.post("/:workspaceId/events", createEvent);

eventRouter.get("/:workspaceId/events", getAllEvents);

eventRouter.get("/:workspaceId/events/:eventId", getEventById);

eventRouter.patch("/:workspaceId/events/:eventId", updateEvent);

eventRouter.delete("/:workspaceId/events/:eventId", deleteEvent);

export default eventRouter;
