// import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import session from "express-session";
import passport from "passport";
import treblle from "@treblle/express";
import swaggerUi from "swagger-ui-express";
import { createServer } from "http";
import { Server } from "socket.io";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";

import Memorystore from "memorystore";
const MemoryStore = Memorystore(session);

import swaggerDocument from "./swagger.json" assert { type: "json" };

// local imports

// Admin
import authRouter from "./admin/auth/auth.routes.js";
import userRouter from "./admin/users/users.routes.js";
import inviteRouter from "./admin/invites/invites.routes.js";
import workspaceRouter from "./admin/workspaces/workspaces.routes.js";

// pm
import milestoneRouter from "./pm/milestones/milestones.routes.js";
import projectRouter from "./pm/projects/projects.routes.js";
import taskRouter from "./pm/tasks/tasks.routes.js";
import subtaskRouter from "./pm/subTasks/subTasks.routes.js";
import projectPriorityRouter from "./pm/projects priority/projectPriority.routes.js";
import tasksStatusRouter from "./pm/tasks status/taskStatus.routes.js";
import tasksPriorityRouter from "./pm/tasks priority/taskPriority.routes.js";
import projectStatusRouter from "./pm/projects status/projectStatus.routes.js";
import taskCommentRouter from "./pm/tasks comments/tasksComments.routes.js";
import taskFileRouter from "./pm/tasks files/tasksFile.routes.js";

// HR
import employeeRouter from "./hr/employees/employees.routes.js";
import teamsRouter from "./hr/teams/teams.routes.js";
import leavesRouter from "./hr/leaves/leaves.routes.js";
import leaveTypeRouter from "./hr/leaves type/leaveType.routes.js";
import leaveCommentRouter from "./hr/leaves comment/leaveComment.routes.js";
import educationRouter from "./hr/education/education.routes.js";
import eventsRouter from "./hr/events/events.routes.js";
import jobsRouter from "./hr/jobs/jobs.routes.js";
import jobResponsesRouter from "./hr/jobResponse/jobResponse.routes.js";
import notificationRouter from "./hr/notifications/notifications.routes.js";

// CHAT
import groupRouter from "./chats/groups/groups.routes.js";
import conversationRouter from "./chats/conversations/conversations.routes.js";
import messageRouter from "./chats/messages/messages.routes.js";

// Document
import folderRouter from "./documents/folders/folders.routes.js";
import fileRouter from "./documents/files/files.routes.js";
import trashbinRouter from "./documents/trashbin/trashbin.routes.js";
import driveRouter from "./documents/drive/drive.routes.js";

dotenv.config();

const app = express();

// socket
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

// using set method to mount the `io` instance on the app to avoid usage of `global`

app.set("io", io);

// Middleware

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*"
        : process.env.CORS_ORIGIN?.split(", "),
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(requestIp.mw());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    // cookie: { maxAge: 86400000 },
    // store: new MemoryStore({
    //   checkPeriod: 86400000,
    // }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// compress using gzip
app.use(compression());

// Helmet for setting secure HTTP headers
app.use(helmet());

// Morgan for HTTP request logging
app.use(morgan("dev"));

// Swagger UI
app.use("/docs", swaggerUi.serve);
app.get(
  "/docs",
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: "none", // keep section collapsed by default
    },
    customSiteTitle: "Teamlyf",
  })
);

// ENDPOINTS
app.get("/", (req, res) => {
  res.send("Healthy API");
});

const basePath = "/api/v1";
// Administration
app.use(`${basePath}/auth`, authRouter);
app.use(`${basePath}/users`, userRouter);
app.use(`${basePath}/workspace`, workspaceRouter);
// app.use(`${basePath}/workspace`, folderRouter);
app.use(`${basePath}/invites`, inviteRouter);
app.use(`${basePath}/workspace`, employeeRouter);
app.use(`${basePath}/workspace`, notificationRouter);

// Task Management
app.use(`${basePath}/workspace`, milestoneRouter);
app.use(`${basePath}/workspace`, projectRouter);
app.use(`${basePath}/workspace`, projectPriorityRouter);
app.use(`${basePath}/workspace`, projectStatusRouter);
app.use(`${basePath}/workspace`, tasksStatusRouter);
app.use(`${basePath}/workspace`, tasksPriorityRouter);
app.use(`${basePath}/workspace`, taskRouter);
app.use(`${basePath}/workspace`, taskCommentRouter);
app.use(`${basePath}/workspace`, subtaskRouter);
app.use(`${basePath}/workspace`, taskFileRouter);

// HR Management
app.use(`${basePath}/workspace`, teamsRouter);
app.use(`${basePath}/workspace`, leavesRouter);
app.use(`${basePath}/workspace`, leaveTypeRouter);
app.use(`${basePath}/workspace`, leaveCommentRouter);
app.use(`${basePath}/workspace`, educationRouter);
app.use(`${basePath}/workspace`, eventsRouter);
app.use(`${basePath}/workspace`, jobsRouter);
app.use(`${basePath}/workspace`, jobResponsesRouter);

// Document Management
app.use(`${basePath}/workspace`, folderRouter);
app.use(`${basePath}/workspace`, fileRouter);
app.use(`${basePath}/workspace`, trashbinRouter);
app.use(`${basePath}/workspace`, driveRouter);

// Chat Management
app.use(`${basePath}/workspace`, groupRouter);
app.use(`${basePath}/workspace`, conversationRouter);
app.use(`${basePath}/workspace`, messageRouter);

export { httpServer };
