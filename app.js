import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";

import {
  authRouter,
  employeeRouter,
  inviteRouter,
  projectRouter,
  spaceRouter,
  subTaskRouter,
  taskRouter,
  teamsRouter,
  userRouter,
  workspaceRouter,
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

// Administration (workspace)
app.use(`${basePath}/workspace`, workspaceRouter);
app.use(`${basePath}/workspace`, employeeRouter);
app.use(`${basePath}/invites`, inviteRouter);
app.use(`${basePath}/workspace`, teamsRouter);

// Task Management
app.use(`${basePath}/workspace`, spaceRouter);
app.use(`${basePath}/workspace`, projectRouter);
app.use(`${basePath}/workspace`, taskRouter);
app.use(`${basePath}/subtasks`, subTaskRouter);

export default app;
