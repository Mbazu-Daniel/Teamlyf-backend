import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import {
  authRouter,
  userRouter,
  organizationsRouter,
  employeeRouter,
  teamsRouter,
  folderRouter,
  projectRouter,
  taskRouter,
  subTaskRouter,
  inviteRouter,
} from "./localImport.js";
dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// ENDPOINTS
app.get("/", (req, res) => {
  res.send("Healthy API");
});

const basePath = "/api/v1";
// Authentication
app.use(`${basePath}/auth`, authRouter);
app.use(`${basePath}/users`, userRouter);

// Administration (Organization)
app.use(`${basePath}/orgs`, organizationsRouter);
app.use(`${basePath}/orgs`, employeeRouter);
app.use(`${basePath}/invites`, inviteRouter);
app.use(`${basePath}/orgs`, teamsRouter);

// Task Management
app.use(`${basePath}/orgs`, folderRouter);
app.use(`${basePath}/projects`, projectRouter);
app.use(`${basePath}/tasks`, taskRouter);
app.use(`${basePath}/subtasks`, subTaskRouter);

export default app;
