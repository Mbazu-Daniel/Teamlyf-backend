// local imports
import authRouter from "./admin/auth/auth.routes.js";
import employeeRouter from "./hr/employees/employees.routes.js";
import inviteRouter from "./admin/invites/invites.routes.js";
import projectRouter from "./pm/projects/projects.routes.js";
import spaceRouter from "./pm/spaces/spaces.routes.js";
import subtaskRouter from "./pm/subTasks/subTasks.routes.js";
import taskRouter from "./pm/tasks/tasks.routes.js";
import taskCommentRouter from "./pm/tasksComments/tasksComments.routes.js";
import taskFileRouter from "./pm/tasksFile/tasksFile.routes.js";
import teamsRouter from "./hr/teams/teams.routes.js";
import userRouter from "./admin/users/users.routes.js";
import workspaceRouter from "./admin/workspaces/workspaces.routes.js";
import leavesRouter from "./hr/leaves/leaves.routes.js";
import leaveTypeRouter from "./hr/leaveType/leaveType.routes.js";
import leaveCommentRouter from "./hr/leaveComment/leaveComment.routes.js";

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
  leavesRouter,
  leaveTypeRouter,
  leaveCommentRouter,
};
