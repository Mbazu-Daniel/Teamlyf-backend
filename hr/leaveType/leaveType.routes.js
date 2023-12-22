import express from "express";
import {
  createLeaveType,
  getAllLeaveType,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
} from "./leaveType.controllers.js";
import { verifyToken } from "../../helper/middleware/authenticate.js";
import {
  getCurrentWorkspace,
  getCurrentEmployee,
} from "../../helper/middleware/index.js";

const leaveTypeRouter = express.Router({ mergeParams: true });

leaveTypeRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

leaveTypeRouter.use("/:workspaceId", getCurrentEmployee, getCurrentWorkspace);
leaveTypeRouter.post("/:workspaceId/leave-types/create", createLeaveType);
leaveTypeRouter.get("/:workspaceId/leave-types", getAllLeaveType);
leaveTypeRouter.get("/:workspaceId/leave-types/:leaveTypeId", getLeaveTypeById);
leaveTypeRouter.patch("/:workspaceId/leave-types/update", updateLeaveType);

leaveTypeRouter.delete("/:workspaceId/leave-types/delete", deleteLeaveType);

export default leaveTypeRouter;
