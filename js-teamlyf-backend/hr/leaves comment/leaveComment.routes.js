import express from 'express';
import {
	createLeaveComment,
	getAllLeaveComments,
	getLeaveCommentById,
	updateLeaveComment,
	deleteLeaveComment,
} from './leaveComment.controllers.js';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentWorkspace,
	getCurrentEmployee,
} from '../../utils/middleware/index.js';

const app = express();
const leaveCommentRouter = express.Router();

app.use(
	'/workspace',
	leaveCommentRouter

	//  #swagger.tags = ['Leave Comment']
);

leaveCommentRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

leaveCommentRouter.use(
	'/:workspaceId',
	getCurrentEmployee,
	getCurrentWorkspace
);
leaveCommentRouter.post(
	'/:workspaceId/leave/:leaveId/leave-comments',
	createLeaveComment
);
leaveCommentRouter.get(
	'/:workspaceId/leave/:leaveId/leave-comments',
	getAllLeaveComments
);
leaveCommentRouter.get(
	'/:workspaceId/leave/:leaveId/leave-comments/:leaveCommentId',
	getLeaveCommentById
);
leaveCommentRouter.patch(
	'/:workspaceId/leave/:leaveId/leave-comments/:leaveCommentId',
	updateLeaveComment
);

leaveCommentRouter.delete(
	'/:workspaceId/leave/:leaveId/leave-comments/:leaveCommentId',
	deleteLeaveComment
);

export default leaveCommentRouter;
