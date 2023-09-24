// local imports
import connectDB from "./config/connectDB.js";
import authRouter from "./auth/auth.routes.js";
import userRouter from "./users/users.routes.js";
import organizationsRouter from "./organizations/organizations.routes.js";
import employeeRouter from "./employees/employees.routes.js";
import teamsRouter from "./teams/teams.routes.js";
import projectRouter from "./projects/projects.routes.js";
import taskRouter from "./tasks/tasks.routes.js";
import subTaskRouter from "./subTasks/subTasks.routes.js";
import inviteRouter from "./invites/invites.routes.js";
import spaceRouter from "./spaces/spaces.routes.js";

export {
  connectDB,
  authRouter,
  userRouter,
  organizationsRouter,
  employeeRouter,
  teamsRouter,
  spaceRouter,
  projectRouter,
  taskRouter,
  subTaskRouter,
  inviteRouter,
};
