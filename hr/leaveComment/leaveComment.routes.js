import express from "express";
import {
    createLeaveComment,
    getAllLeaveComments,
    getLeaveCommentById,
    updateLeaveComment,
    deleteLeaveComment,
} from "./leaveComment.controllers.js";
import { verifyToken } from "../../helper/middleware/authenticate.js";
import {
  getCurrentWorkspace,
  getCurrentEmployee,
} from "../../helper/middleware/index.js";

const leaveCommentRouter = express.Router({ mergeParams: true });

leaveCommentRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

leaveCommentRouter.use("/:workspaceId", getCurrentEmployee, getCurrentWorkspace);
leaveCommentRouter.post("/:workspaceId/leave/:leaveId/leave-comments", createLeaveComment);
leaveCommentRouter.get("/:workspaceId/leave/:leaveId/leave-comments", getAllLeaveComments);
leaveCommentRouter.get("/:workspaceId/leave/:leaveId/leave-comments/:leaveCommentId", getLeaveCommentById);
leaveCommentRouter.patch("/:workspaceId/leave/:leaveId/leave-comments/:leaveCommentId", updateLeaveComment);

leaveCommentRouter.delete("/:workspaceId/leave/:leaveId/leave-comments/:leaveCommentId", deleteLeaveComment);

export default leaveCommentRouter;
