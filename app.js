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
  max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.limit
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
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// compress using gzip
app.use(compression());

// Helmet for setting secure HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'wasm-eval'"],
      imgSrc: ["'self'", `${{ API_URL }}`],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

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

const V1_BASE_PATH = "/api/v1";
// Administration
app.use(`${V1_BASE_PATH}/auth`, authRouter);
app.use(`${V1_BASE_PATH}/users`, userRouter);
app.use(`${V1_BASE_PATH}/workspace`, workspaceRouter);
// app.use(`${V1_BASE_PATH}/workspace`, folderRouter);
app.use(`${V1_BASE_PATH}/invites`, inviteRouter);
app.use(`${V1_BASE_PATH}/workspace`, employeeRouter);
app.use(`${V1_BASE_PATH}/workspace`, notificationRouter);

// Task Management
app.use(`${V1_BASE_PATH}/workspace`, milestoneRouter);
app.use(`${V1_BASE_PATH}/workspace`, projectRouter);
app.use(`${V1_BASE_PATH}/workspace`, projectPriorityRouter);
app.use(`${V1_BASE_PATH}/workspace`, projectStatusRouter);
app.use(`${V1_BASE_PATH}/workspace`, tasksStatusRouter);
app.use(`${V1_BASE_PATH}/workspace`, tasksPriorityRouter);
app.use(`${V1_BASE_PATH}/workspace`, taskRouter);
app.use(`${V1_BASE_PATH}/workspace`, taskCommentRouter);
app.use(`${V1_BASE_PATH}/workspace`, subtaskRouter);
app.use(`${V1_BASE_PATH}/workspace`, taskFileRouter);

// HR Management
app.use(`${V1_BASE_PATH}/workspace`, teamsRouter);
app.use(`${V1_BASE_PATH}/workspace`, leavesRouter);
app.use(`${V1_BASE_PATH}/workspace`, leaveTypeRouter);
app.use(`${V1_BASE_PATH}/workspace`, leaveCommentRouter);
app.use(`${V1_BASE_PATH}/workspace`, educationRouter);
app.use(`${V1_BASE_PATH}/workspace`, eventsRouter);
app.use(`${V1_BASE_PATH}/workspace`, jobsRouter);
app.use(`${V1_BASE_PATH}/workspace`, jobResponsesRouter);

// Document Management
app.use(`${V1_BASE_PATH}/workspace`, folderRouter);
app.use(`${V1_BASE_PATH}/workspace`, fileRouter);
app.use(`${V1_BASE_PATH}/workspace`, trashbinRouter);
app.use(`${V1_BASE_PATH}/workspace`, driveRouter);

// Chat Management
app.use(`${V1_BASE_PATH}/workspace`, groupRouter);
app.use(`${V1_BASE_PATH}/workspace`, conversationRouter);
app.use(`${V1_BASE_PATH}/workspace`, messageRouter);

export { httpServer };
