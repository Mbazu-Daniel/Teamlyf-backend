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

import swaggerDocument from "./swagger.json" assert { type: "json" };

// local imports
import authRouter from "./admin/auth/auth.routes.js";
import employeeRouter from "./hr/employees/employees.routes.js";
import inviteRouter from "./admin/invites/invites.routes.js";
import projectRouter from "./pm/projects/projects.routes.js";
// import spaceRouter from "./pm/spaces/spaces.routes.js";
// import subtaskRouter from "./pm/subTasks/subTasks.routes.js";
// import taskRouter from "./pm/tasks/tasks.routes.js";
// import taskCommentRouter from "./pm/tasksComments/tasksComments.routes.js";
// import taskFileRouter from "./pm/tasksFile/tasksFile.routes.js";
import teamsRouter from "./hr/teams/teams.routes.js";
import userRouter from "./admin/users/users.routes.js";
import workspaceRouter from "./admin/workspaces/workspaces.routes.js";
import leavesRouter from "./hr/leaves/leaves.routes.js";
import leaveTypeRouter from "./hr/leaveType/leaveType.routes.js";
import leaveCommentRouter from "./hr/leaveComment/leaveComment.routes.js";
import projectPriorityRouter from "./pm/projectPriority/projectPriority.routes.js";
import customTaskStatus from "./pm/taskStatus/taskStatus.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(
//   treblle({
//     apiKey: process.env.TREBLLE_API_KEY,
//     projectId: process.env.TREBLLE_PROJECT_ID,
//     additionalFieldsToMask: [],
//   })
// );
app.use(
  session({
    secret: process.env.SESSION_SECRETS,
    resave: false,
    saveUninitialized: true,
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
// // Authentication
app.use(`${basePath}/auth`, authRouter);
app.use(`${basePath}/users`, userRouter);

// Administration (workspace)
app.use(`${basePath}/workspace`, workspaceRouter);
app.use(`${basePath}/workspace`, employeeRouter);
app.use(`${basePath}/invites`, inviteRouter);

// Task Management
// app.use(`${basePath}/workspace`, spaceRouter);
app.use(`${basePath}/workspace`, projectRouter);
app.use(`${basePath}/workspace`, projectPriorityRouter);
app.use(`${basePath}/workspace`, customTaskStatus);
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
