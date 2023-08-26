// local imports
import connectDB from "./config/connectDB.js";
import authRouter from "./auth/auth.routes.js";
import userRouter from "./users/users.routes.js";
import organizationsRouter from "./organizations/organizations.routes.js";
import teamsRouter from "./teams/teams.routes.js";
teamsRouter;
import employeeRouter from "./employees/employees.routes.js";
export {
  connectDB,
  authRouter,
  userRouter,
  teamsRouter,
  organizationsRouter,
  employeeRouter,
};
