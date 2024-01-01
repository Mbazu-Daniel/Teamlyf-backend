import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import session from 'express-session';
import passport from 'passport';

import {
  authRouter,
  employeeRouter,
  inviteRouter,
  // projectRouter,
  // spaceRouter,
  // subtaskRouter,
  // taskCommentRouter,
  // taskFileRouter,
  // taskRouter,
  teamsRouter,
  userRouter,
  workspaceRouter,
  leavesRouter,
  leaveTypeRouter,
  leaveCommentRouter,
} from "./localImport.js";
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRETS,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

// compress using gzip
app.use(compression());

// Helmet for setting secure HTTP headers
app.use(helmet());

// Morgan for HTTP request logging
app.use(morgan("dev"));

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

// Task Management
// app.use(`${basePath}/workspace`, spaceRouter);
// app.use(`${basePath}/workspace`, projectRouter);
// app.use(`${basePath}/workspace`, taskRouter);
// app.use(`${basePath}/workspace`, taskCommentRouter);
// app.use(`${basePath}/workspace`, subtaskRouter);
// app.use(`${basePath}/workspace`, taskFileRouter);

// HR Management
app.use(`${basePath}/workspace`, teamsRouter);
app.use(`${basePath}/workspace`, leavesRouter);
app.use(`${basePath}/workspace`, leaveTypeRouter);
app.use(`${basePath}/workspace`, leaveCommentRouter);

export default app;
