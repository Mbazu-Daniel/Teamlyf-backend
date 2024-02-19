import express from "express";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";

import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "./notifications.controllers.js";

const notificationRouter = express.Router();
const app = express();

app.use(
  "/workspace",
  notificationRouter
  /* 
  
  #swagger.tags = ['Notification']
  */
);
notificationRouter.use(verifyToken, getCurrentEmployee, getCurrentWorkspace);

notificationRouter.post("/:workspaceId/notifications", createNotification);
notificationRouter.get("/:workspaceId/notifications", getNotifications);
notificationRouter.get(
  "/:workspaceId/notifications/:notificationId/mark-as-read",
  markNotificationAsRead
);
notificationRouter.delete(
  "/:workspaceId/notifications/:notificationId",
  deleteNotification
);

export default notificationRouter;
