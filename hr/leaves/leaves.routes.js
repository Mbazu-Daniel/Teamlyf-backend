import express from "express";
import {
  createLeave,
  getAllWorkspaceLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
  getEmployeeLeaves,
  updateLeaveStatus,
} from "./leaves.controllers.js";
import { verifyToken } from "../../helper/middleware/authenticate.js";
import {
  getCurrentWorkspace,
  getCurrentEmployee,
  checkLeaveExists,
} from "../../helper/middleware/index.js";

const app = express();
const leavesRouter = express.Router();

app.use(
  "/",
  leavesRouter

  //  #swagger.tags = ['Leave']
);

leavesRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

leavesRouter.use("/:workspaceId", getCurrentEmployee, getCurrentWorkspace);
leavesRouter.post("/:workspaceId/leaves", createLeave);
leavesRouter.get("/:workspaceId/leaves", getAllWorkspaceLeaves);
leavesRouter.get("/:workspaceId/leaves/employee", getEmployeeLeaves);
leavesRouter.get("/:workspaceId/leaves/:leaveId", getLeaveById);
leavesRouter.patch(
  "/:workspaceId/leaves/:leaveId",
  checkLeaveExists,
  updateLeave
);
leavesRouter.patch(
  "/:workspaceId/leaves/:leaveId/status",
  checkLeaveExists,
  updateLeaveStatus
);

leavesRouter.delete(
  "/:workspaceId/leaves/:leaveId",
  checkLeaveExists,
  deleteLeave
);

export default leavesRouter;
