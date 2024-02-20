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
import Memorystore from "memorystore";
const MemoryStore = Memorystore(session);

import swaggerDocument from "./swagger.json" assert { type: "json" };

// local imports

// Admin
import authRouter from "./admin/auth/auth.routes.js";
import userRouter from "./admin/users/users.routes.js";
import inviteRouter from "./admin/invites/invites.routes.js";
import workspaceRouter from "./admin/workspaces/workspaces.routes.js";
import notificationRouter from "./admin/notifications/notifications.routes.js";

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

// CHAT
import groupRouter from "./chats/groups/groups.routes.js";
import conversationRouter from "./chats/conversations/conversations.routes.js";
import messageRouter from "./chats/messages/messages.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRETS,
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

// Swagger UI
app.use("/docs", swaggerUi.serve);
app.get("/docs", swaggerUi.setup(swaggerDocument));

// ENDPOINTS
app.get("/", (req, res) => {
  res.send("Healthy API");
});

const basePath = "/api/v1";
// Administration
app.use(`${basePath}/auth`, authRouter);
app.use(`${basePath}/users`, userRouter);
app.use(`${basePath}/invites`, inviteRouter);
app.use(`${basePath}/workspace`, workspaceRouter);
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

// Chat Management
app.use(`${basePath}/workspace`, groupRouter);
app.use(`${basePath}/workspace`, conversationRouter);
app.use(`${basePath}/workspace`, messageRouter);

export default app;
