import express from "express";
import {
  createLeaveTypes,
  getAllLeaveTypes,
  getLeaveTypeById,
  updateLeaveTypes,
  deleteLeaveTypes,
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
leaveTypeRouter.post("/:workspaceId/leave-types/create", createLeaveTypes);
leaveTypeRouter.get("/:workspaceId/leave-types", getAllLeaveTypes);
leaveTypeRouter.get("/:workspaceId/leave-types/:leaveTypeId", getLeaveTypeById);
leaveTypeRouter.patch("/:workspaceId/leave-types/update", updateLeaveTypes);

leaveTypeRouter.delete("/:workspaceId/leave-types/delete", deleteLeaveTypes);

export default leaveTypeRouter;
