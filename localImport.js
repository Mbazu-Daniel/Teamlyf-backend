// local imports
import authRouter from "./auth/auth.routes.js";
import employeeRouter from "./employees/employees.routes.js";
import inviteRouter from "./invites/invites.routes.js";
import projectRouter from "./projects/projects.routes.js";
import spaceRouter from "./spaces/spaces.routes.js";
import subtaskRouter from "./subTasks/subTasks.routes.js";
import taskRouter from "./tasks/tasks.routes.js";
import taskCommentRouter from "./tasksComments/tasksComments.routes.js";
import taskFileRouter from "./tasksFile/tasksfile.routes.js";
import teamsRouter from "./teams/teams.routes.js";
import userRouter from "./users/users.routes.js";
import workspaceRouter from "./workspaces/workspaces.routes.js";

export {
  authRouter,
  employeeRouter,
  inviteRouter,
  projectRouter,
  spaceRouter,
  subtaskRouter,
  taskCommentRouter,
  taskFileRouter,
  taskRouter,
  teamsRouter,
  userRouter,
  workspaceRouter,
};
